const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const HttpStatus = require('http-status-codes')
const config = require('../../config')
const fs = require('fs')
const path = require('path')
const { safeCreateDirectory, verifyIfFileExists, getMimeTypeFromFilePath } = require('../../utils/fs-safe')
const User = require('../../identity/user')
const { cacheForDuration } = require('../../utils/cache-helper')

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json({ extended: true, limit: '1mb' }))

router.get('/profile-pic', async (req, res) => {
    if (!req.user) {
        return res.status(HttpStatus.FORBIDDEN).send({})
    }

    let user
    if (req.query.username) {
        user = await User.findOne({ username: req.query.username })
    }
    else {
        user = req.user
    }

    if (!user.profilePictureLocation) {
        return res.status(HttpStatusOk).send('')
    }

    res.set(cacheForDuration('10m'))
    return res.contentType(getMimeTypeFromFilePath(user.profilePictureLocation)).sendFile(user.profilePictureLocation, { maxAge: '10m' })
})

// list processes
router.put('/profile-pic', async (req, res) => {
    let exists = await verifyIfFileExists(fs, config.fileServerPath)
    if (!exists) {
        await safeCreateDirectory(fs, config.fileServerPath)
    }

    if (!req.user) {
        return res.status(HttpStatus.FORBIDDEN).send({})
    }

    let base64 = req.body.base64.replace('data:image/jpeg;base64,', '')
    let outputPath = path.join(config.fileServerPath, `${req.userId}_profilePic.jpg`)
    await fs.promises.writeFile(outputPath, base64, { encoding: 'base64' })
    
    req.user.profilePictureLocation = outputPath
    await req.user.save()

    return res.send({})
})

router.get('/', async (req, res) => {
    if (!req.user) {
        return res.status(HttpStatus.FORBIDDEN).send({})
    }

    return res.send({
        username: req.user.username,
        hostname: req.user.hostname,
        notificationPreference: req.user.notificationPreference,
        passwordTip: req.user.passwordTip,
        admin: req.user.admin,
        updatedAt: req.user.updatedAt,
        createdAt: req.user.createdAt,
    })
})

router.put('/preferences', async (req, res) => {
    if (!req.user) {
        return res.status(HttpStatus.FORBIDDEN).send({})
    }

    req.user.notificationPreference = req.body.notificationPreference
    req.user.passwordTip = req.body.passwordTip
    await req.user.save()

    return res.send({})
})

module.exports = router