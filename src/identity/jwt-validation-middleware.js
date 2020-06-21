const HttpStatus = require('http-status-codes')
const jwt        = require('jsonwebtoken')
const config     = require('../config.js')
const User       = require('./user')

module.exports = (req, res, next) => {

    // Ignore static files (JS, png, jpeg, etc.)
    let dontAuthenticatePatterns = config.dontAuthenticate || []
    for (let pattern of dontAuthenticatePatterns) {
        let regexp = new RegExp(pattern)
        if (regexp.test(req.path)) {
            return next()
        }
    }
    var token = req.headers['x-access-token'];

    if (!token) {
        token = req.cookies['x-access-token']
    }

    let isLoginPath = (req.baseUrl === config.login_path || req.baseUrl === config.registration_path)

    if (!token && !isLoginPath) {
        return res.status(HttpStatus.UNAUTHORIZED).redirect(`${config.login_path}?redirect_url=${req.path}`)
    }

    if (!token && isLoginPath) {
        return next()
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            res.clearCookie('x-access-token')
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Invalid token' });
        }

        let user = await User.findById(decoded.id)
        if (!user) {
            res.clearCookie('x-access-token')
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Invalid token' });
        }

        req.headers['x-user-id'] = decoded.id
        req.userId = decoded.id;

        if (isLoginPath) {
            return res.redirect('/')
        }

        next();
    });
}