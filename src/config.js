module.exports = {
    service_name: 'API GATEWAY',
    mongo_url: 'mongodb://localhost:3010',
    db_name: 'macrohard',
    secret: process.env.SECRET || 'MY SECRET PASSWORD',
    gateway_port: process.env.PORT || 5000,
    tokenExpiresIn: '24h',
    services_urls: {
        user: 'http://localhost:3000',
        server_admin: 'http://localhost:3001'
    }
}