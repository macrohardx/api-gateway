const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
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