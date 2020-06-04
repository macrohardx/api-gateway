const HttpStatus = require('http-status-codes')
const jwt = require('jsonwebtoken')
const config = require('../config.js')

module.exports = (req, res, next) => {

    var token = req.headers['x-access-token'];
    if (!token) {
        return res.status(HttpStatus.FORBIDDEN).send({ message: 'No token provided.' });
    }

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
            console.log(err)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        next();
    });
}