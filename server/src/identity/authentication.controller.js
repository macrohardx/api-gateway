const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const User = require('./user')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { validationResult } = require('express-validator')
const userValidations = require('./user-validation')
const HttpStatus = require('http-status-codes')
const Session = require('./session')
const { maybeGetHostName } = require('../utils/ip-helper')

module.exports = () => {

    // register middleware that parses application/x-www-form-urlencoded
    router.use(bodyParser.urlencoded({ extended: true }))

    // register middleware that parses application/json
    router.use(bodyParser.json())

    // api/auth/login
    router.post('/login', login)

    // api/auth/register
    router.post('/register', userValidations, registerUser)

    // api/auth/logout
    router.post('/logout', logout)

    // api/auth/passwordTip
    router.post('/passwordTip', passwordTip)

    return router
}

async function login(req, res) {

    // Verifies if user exists on database
    let user = await User.findOne({ username: req.body.username })
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'User not found' })
    }

    // Validate user password
    if (!user.isPasswordValid(req.body.password)) {
        return res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Password is invalid' })
    }

    // Generate signed token (JWT)
    let token = await createToken(user)

    res.cookie('x-access-token', token, { httpOnly: true, maxAge: config.tokenExpiresIn * 1000 })

    res.status(HttpStatus.OK).send({ token })
}

async function registerUser(req, res) {

    // Gather all validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ message: errors.array().map(e => e.msg).join('<br>') });
    }

    // Verify if username is already taken by another user
    let isUsernameTaken = await User.findOne({ username: req.body.username })
    if (isUsernameTaken) {
        return res.status(HttpStatus.CONFLICT).send({ message: 'User name is already taken' })
    }

    let hostname
    if (config.user_registration.hostname_required) {
        let maybeHostname = await maybeGetHostName(req.connection.remoteAddress)
        if (!maybeHostname.ok) {
            return res.status(HttpStatus.NOT_ACCEPTABLE).send({ message: `It wasn\'t possible to resolve the host name for the ip: ${req.connection.remoteAddress}` })
        }
        hostname = maybeHostname.hostname
    }

    if (hostname && config.user_registration.block_multi_user_per_host) {
        let isHostnameAlreadyRegistered = await User.findOne({ hostname: hostname })
        if (isHostnameAlreadyRegistered) {
            return res.status(HttpStatus.CONFLICT).send({ message: `You can't register more than one user per host. host name: ${hostname}, host current ip: ${req.connection.remoteAddress}` })
        }
    }

    // Creates a new user and store it in the database
    let user = await User.create({
        username: req.body.username,
        password: req.body.password,
        passwordTip: req.body.passwordTip,
        hostname: hostname
    })

    // Generate signed token (JWT)
    let token = await createToken(user)

    res.cookie('x-access-token', token, { httpOnly: true, maxAge: config.tokenExpiresIn * 1000 })

    return res.status(HttpStatus.CREATED).send({ token })
}

const createToken = async (user) => {

    // Creates new session
    const session = await getOrCreateUserSession(user)

    return jwt.sign({
        id: user._id,
        username: user.username,
        session_id: session.id
    }, config.secret, {
        expiresIn: config.tokenExpiresIn
    })
}

const getOrCreateUserSession = async (user) => {

    const now = new Date()
    const session = await Session.findOne({ user_id: user.id, loggedOutAt: null, expiresAt: { '$gt': now } })
    if (session) {
        return session
    }

    let expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + config.tokenExpiresIn)
    return await Session.create({
        user_id: user.id,
        loggedInAt: now,
        expiresAt: expiresAt
    })
}

async function logout(req, res) {
    var token = req.headers['x-access-token'];

    if (!token) {
        token = req.cookies['x-access-token']
    }

    if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid Session' })
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid Session' })
        }
        let session = await Session.findById(decoded.session_id)
        await session.updateOne({ loggedOutAt: new Date() })

        res.clearCookie('x-access-token')
        res.sendStatus(HttpStatus.OK)
    })
}

async function passwordTip (req, res) {
    // Verifies if user exists on database
    let user = await User.findOne({ username: req.body.username })
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'User not found' })
    }
    res.status(HttpStatus.OK).send({ data: user.passwordTip })
}