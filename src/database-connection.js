const mongoose = require('mongoose')
const config = require('./config.js')

module.exports.connect = async () => {
    let connection_url = `${config.mongo_url}/${config.db_name}`
    await mongoose.connect(connection_url, {
        useNewUrlParser: true,
        //useUnifiedTopology: true, // Timeout doesn't work with this option on
        useCreateIndex: true,
        connectTimeoutMS: config.db_connection_timeout,
        socketTimeoutMS: config.db_connection_timeout
    })
    console.log(`connected to mongo at: ${connection_url}`)
}