module.exports = {
    service_name: 'API GATEWAY',
    mongo_url: 'mongodb://localhost:3010',
    db_name: 'macrohard',
    db_connection_timeout: 10000,
    secret: process.env.SECRET || 'MY SECRET PASSWORD',
    gateway_port: process.env.GATEWAY_PORT || 5000,
    tokenExpiresIn: '24h'
}