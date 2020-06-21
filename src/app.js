const express = require('express')
const app = express()
const HttpStatus = require('http-status-codes')
const { maybeConnectToDatabase } = require('./database-connection')
const mongoose = require('mongoose')
const config = require('./config')
const cacheMiddleware = require('./cache-middleware')
const log = (a) => console.log(a) || true
const path = require('path')
const cookieParser = require('cookie-parser')

module.exports.startApp = async () => {

    let { ok, error } = await maybeConnectToDatabase(mongoose, config.mongo_url, config.db_name, config.db_connection_timeout)
    if (!ok) {
        log(`Error connecting to database - ${error}`)
        return process.exit(1)
    }

    // Start express app
    app.listen(config.gateway_port, () => {
        log(`::::${config.service_name}:::: Listening to http://localhost:${config.gateway_port}`)
    })

    app.use(cookieParser())

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

    // Register authentication routes (register, login, etc)
    const authController = require('./identity/authentication.controller')
    app.use('/api/auth', authController())

    // Endpoint responsible for redirecting the request to it's respective service
    const proxyController = require('./proxy.controller')
    app.use('/', tokenValidator, proxyController())

    // Home page Route
    app.use(config.home_path, tokenValidator, express.static(path.join(__dirname, 'public/home')))
}   