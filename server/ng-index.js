const config = require('./src/config')
const express = require('express')
const app = express()
const path = require('path')
const ipHelper = require('./src/utils/ip-helper')
const os = require('os')

app.listen(4000, '0.0.0.0', () => console.log('listening to 4000'))

const dns = require('dns')
app.get('/foo', async (req, res, next) => {
    let clientIp = req.connection.remoteAddress.replace('::ffff:', '')

    let foo = await ipHelper.maybeGetHostName(clientIp)
    console.log(foo);
    res.send('foo')
})

app.use(express.static(path.join(__dirname, 'client/angular-dist')))