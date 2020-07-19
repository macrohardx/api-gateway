const servicesTable = require('../services-table')
const NodeCache = require('node-cache')
const appCache = new NodeCache()

module.exports = () => {
    const cacheKeyServices = 'services-table'

    return (req, _res, next) => {
        let configTtl = new Date(appCache.getTtl(cacheKeyServices) || 0)
        let now = (new Date()).getTime()
        if (configTtl.getTime() >= now) {
            req.servicesTable = appCache.get(cacheKeyServices)
        }
        else {
            req.servicesTable = servicesTable.get()
            appCache.set(cacheKeyServices, req.servicesTable, 10)
        }
        next()
    }
}