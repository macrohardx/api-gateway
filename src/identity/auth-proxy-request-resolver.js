module.exports = (req) => {
    let hasQueryString = req.url.indexOf('?') !== -1
    return req.url + `${hasQueryString ? '&' : '?'}userId=${req.userId}`
}