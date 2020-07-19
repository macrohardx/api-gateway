const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordTip: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
    profilePictureLocation: { type: String, required: false },
    notificationPreference: { type: String, required: true, default: 'all' },
    hostname: {type: String, required: false },
    createdAt: Date,
    updatedAt: Date
})

userSchema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password)
    }

    this.updatedAt = new Date()
    if (!this.createdAt) {
        this.createdAt = this.updatedAt
    }
    next()
})

userSchema.methods.isPasswordValid = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema, 'users')