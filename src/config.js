module.exports = {
    service_name: 'API GATEWAY',
    mongo_url: 'mongodb://localhost:3010',
    db_name: 'macrohard',
    login_path: '/static/login',
    registration_path: '/static/registration',
    home_path: '/',
    db_connection_timeout: 10000,
    secret: process.env.SECRET || 'MY SECRET PASSWORD',
    gateway_port: process.env.GATEWAY_PORT || 5000,
    tokenExpiresIn: 86400,
    dontAuthenticate: [
        "^.*\.(tif|png|jpeg|jpg|bmp|css|js|ts|map|json|webp|ico|icon|woff|woff2|oft|ttf)$"
    ]
}