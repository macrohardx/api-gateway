const { check, body } = require('express-validator')

module.exports = [
    check('email').isEmail(),
    check('username').isLength({ min: 3 }),
    check('password').isLength({ min: 8 }),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value === req.body.password) {
            throw new Error('Password confirmation does not match password')
        }
        return true
    })
]