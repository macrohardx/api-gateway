const express              = require('express')
const router               = express.Router()
const bodyParser           = require('body-parser')
const User                 = require('./user')
const jwt                  = require('jsonwebtoken')
const config               = require('../config')
const { validationResult } = require('express-validator')
const userValidations      = require('./user-validation')
const HttpStatus           = require('http-status-codes')

// register middleware that parses application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }))

// register middleware that parses application/json
router.use(bodyParser.json())

// api/auth/login
router.post('/login', async (req, res) => {

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
    let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: config.tokenExpiresIn
    })

    res.status(HttpStatus.OK).send({ token })
})

// api/auth/register
router.post('/register', userValidations, async (req, res) => {

    // Gather all validation errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ errors: errors.array() });
    }

    // Verify if username is already taken by another user
    let isUsernameTaken = await User.findOne({ username: req.body.username })
    if (isUsernameTaken) {
        return res.status(HttpStatus.CONFLICT).send({ message: 'User name is already taken' })
    }

    // Creates a new user and store it in the database
    let user = await User.create({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    })

    // Generate signed token (JWT)
    let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: config.tokenExpiresIn
    })
    
    return res.status(HttpStatus.CREATED).send({ token })
})

module.exports = router