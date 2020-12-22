const express = require('express')
const app = express()
const HttpStatus = require('http-status-codes')
const { maybeConnectToDatabase } = require('./utils/database-connection')
const mongoose = require('mongoose')
const config = require('./config')
const cacheMiddleware = require('./utils/cache-middleware')
const log = (a) => console.log(a) || true
const path = require('path')
const cookieParser = require('cookie-parser')
const hostname = require('os').hostname()
const fs = require('fs')
const httpsServer = require('https').createServer({
    cert: fs.readFileSync(path.join(__dirname, 'sslcert/MacroHard.crt'), 'utf-8'),
    key: fs.readFileSync(path.join(__dirname, 'sslcert/MacroHard.key'), 'utf-8'),
}, app)
const httpServer = require('http').createServer(app);
const cors = require('cors');

module.exports.startApp = async () => {

    let { ok, error } = await maybeConnectToDatabase(mongoose, config.mongo_url, config.db_name, config.db_connection_timeout)
    if (!ok) {
        log(`Error connecting to database - ${error}`)
        return process.exit(2)
    }

    // Start express app
    httpsServer.listen(config.gateway_port_ssl, '0.0.0.0', () => {
        log(`::::${config.service_name}:::: Listening to https://${hostname}:${config.gateway_port_ssl}`)
    })
    httpServer.listen(config.gateway_port, '0.0.0.0', () => {
        log(`::::${config.service_name}:::: Listening to http://${hostname}:${config.gateway_port}`)
    });
    
    app.use(cors({
        origin: 'http://localhost:4200',
        credentials: true
    }));

    app.use(cookieParser());

    // Middleware to handle cache results (also populates the services reference table)
    app.use(cacheMiddleware())

    // Health check endpoint used to verify gateway status
    app.get('/hc', (_req, res) => res.status(HttpStatus.OK).send({ status: 'Online' }))

    // Register authentication middleware for all other endpoints
    const tokenValidator = require('./identity/jwt-validation-middleware')

    // User Registration Route
    app.use(config.registration_path, tokenValidator, express.static(path.join(__dirname, 'public/registration')))

    // User Login Route
    app.use(config.login_path, tokenValidator, express.static(path.join(__dirname, 'public/login')))

    app.use('/app', tokenValidator, express.static(path.join(__dirname, '../../client/angular-dist')))
    app.use('/app/*', tokenValidator, express.static(path.join(__dirname, '../../client/angular-dist/index.html')))

    const userSettingRoute = require('./api/user-settings/user-settings.api')
    app.use('/api/user', tokenValidator, userSettingRoute);

    // Register authentication routes (register, login, etc)
    const authController = require('./identity/authentication.controller')
    app.use('/api/auth', authController())

    // Endpoint responsible for redirecting the request to it's respective service
    const proxyController = require('./proxy.controller')
    app.use('/', tokenValidator, proxyController(hostname, config.gateway_port))

    // Home page Route
    app.use(config.home_path, tokenValidator, express.static(path.join(__dirname, 'public/home')))
}   