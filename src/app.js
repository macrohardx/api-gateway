const app = require('express')()
const HttpStatus = require('http-status-codes')
const dbConnection = require('./database-connection')
const config = require('./config')
const cacheMiddleware = require('./cache-middleware')
const server = require('http').createServer(app)

module.exports.startApp = async () => {

    await dbConnection.connect()

    // Middleware to handle cache results (also populates the services reference table)
    app.use(cacheMiddleware())

    // Health check endpoint used to verify gateway status
    app.get('/hc', (_req, res) => res.status(HttpStatus.OK).send({ status: 'Online' }))

    // Register authentication routes (register, login, etc)
    const authController = require('./identity/authentication.controller')
    app.use('/api/auth', authController)

    // Register authentication middleware for all other endpoints
    // const tokenValidator = require('./identity/jwt-validation-middleware')
    // app.use(tokenValidator)

    // Endpoint responsible for redirecting the request to it's respective service
    const proxyController = require('./proxy.controller')


    app.use('/api', proxyController)

    // Start express app
    app.listen(config.gateway_port, () => {
        console.log(`::::${config.service_name}:::: Listening to http://localhost:${config.gateway_port}`)
    })
}   