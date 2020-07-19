const { check, body } = require('express-validator')

module.exports = [
    check('username', 'User name must be at least 3 characters long').isLength({ min: 3 }),
    check('password', 'Password must be at least 6 character long').isLength({ min: 3 }),
    check('passwordTip', 'Password must be at least 6 character long').isLength({ min: 3 }),
    body('passwordConfirmation', 'Password confirmation does not match password').custom((value, { req }) => value === req.body.password)
]