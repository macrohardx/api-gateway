const { toMilliseconds } = require('./time-helper')

module.exports = {
    cacheForDuration: (time) => {
        let millis = toMilliseconds(time)
        return {
            "Cache-Control": `public, max-age=${millis}`,
            "Expires": new Date(Date.now() + millis).toUTCString()
        }
    }
}