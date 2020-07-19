const mongoose = require('mongoose')
const Schema = mongoose.Schema

const sessionSchema = new Schema({
    user_id: { type: String, required: true },
    loggedInAt: Date,
    loggedOutAt: Date,
    expiresAt: Date
})

module.exports = mongoose.model('Session', sessionSchema, 'sessions')