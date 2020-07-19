const { get, keys, find } = require('lodash')
const { createProxyMiddleware } = require('http-proxy-middleware')
const url = require('url')

// Local cache with built proxies
const proxies = {}

module.exports = (serverIp, port) => (req, res, next) => {
    req.headers['x-client-ip'] = req.connection.remoteAddress
    req.headers['x-gateway'] = `${serverIp}:${port}`

    let proxyTarget = getPathTarget(req.servicesTable, req.originalUrl)
    if (proxyTarget) {
        // It's not possible to create the proxy per request, since the socket upgrade needs to happen on the same connection
        const serviceProxy = proxies[proxyTarget] || createProxyMiddleware(proxyTarget, {
            target: proxyTarget,
            ws: true, // Accept upgrade to websocket connection
            logLevel: 'error',
            changeOrigin: true,
            xfwd: true
        })
        serviceProxy(req, res, next)
        proxies[proxyTarget] = serviceProxy
    }
    else {
        next()
    }
}

function getPathTarget(list, path) {
    let key = find(keys(list), (key) => {
        return new RegExp(`^${key}.*`).test(path)
    })
    return get(list, `[${key}].service_uri`)
}