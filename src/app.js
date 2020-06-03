const express = require('express')
const app = express()
const HttpStatus = require('http-status-codes')
const dbConnection = require('./database-connection')
const config = require('./config')

module.exports.startApp = async () => {

    await dbConnection.connect()

    app.get('/hc', (_req, res) => res.status(HttpStatus.OK).send({ status: 'ONLINE' }))

    const AuthController = require('./identity/authentication.controller')
    app.use('/api/auth', AuthController)

    app.listen(config.gateway_port, () => {
        console.log(`::::${config.service_name}:::: Listening to http://localhost:${config.gateway_port}`)
    })
}   