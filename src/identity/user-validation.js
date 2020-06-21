const { check, body } = require('express-validator')

module.exports = [
    check('username', 'User name must be at least 3 characters long').isLength({ min: 3 }),
    body('password', 'Password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters').custom((value, {req}) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32})/.test(value)
    }),
    body('passwordConfirmation', 'Password confirmation does not match password').custom((value, { req }) => 
        value === req.body.password)
]