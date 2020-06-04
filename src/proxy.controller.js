const { get } = require('lodash')
const proxyReqPathResolver = require('./identity/auth-proxy-request-resolver')
const proxy = require('express-http-proxy')

module.exports = (req, res, next) => {
    const serviceName = get(req.url.split('/'), '[1]', '').toLocaleLowerCase()

    // TODO: Use reference table to get starting url
    //req.url = req.originalUrl
    //req.url = '/'

    req.headers['x-real-ip'] = req.connection.remoteAddress
    if (req.servicesTable[serviceName]) {
        const serviceProxy = proxy(req.servicesTable[serviceName], { proxyReqPathResolver })
        serviceProxy(req, res, next)
    }
    else {
        next()
    }
}