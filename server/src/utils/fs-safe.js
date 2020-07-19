/**
 * Safely deletes a folder an all it's contents. 'Promisified' version of rmdir that doesn't throw
 * @param {Object} fsModule 
 * @param {String} pathToRemove 
 * @returns {Promise<void>}
 */
const safeRemoveFolder = (removeFolder, pathToRemove) =>
    new Promise((success, failure) =>
        removeFolder(pathToRemove, (err) =>
            err ? failure(new Error(err))
                : success(true)))

/**
 * Safely creates a directory. 'Promisified' version of mkdir that doesn't throw
 * @param {Object} fsModule 
 * @param {String} pathToCreate 
 * @returns {Promise<void>}
 */
const safeCreateDirectory = (fsModule, pathToCreate) =>
    new Promise((success, fail) =>
        fsModule.mkdir(pathToCreate, { recursive: true }, (err) =>
            err ? fail(new Error(err))
                : success(true)))

/**
 * Verify if a user has access to a file
 * @param {fs} fsModule 
 * @param {String} pathToFile 
 * @returns {Promise<Boolean>}
 */
const verifyIfFileExists = (fsModule, pathToFile) =>
    new Promise((success) =>
        fsModule.access(pathToFile, (err) =>
            success(!err)))

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
}

const path = require('path')
const getMimeTypeFromFilePath = (filePath) => {
    return mime[path.extname(filePath).slice(1)] || 'text/plain'
}

module.exports = {
    safeRemoveFolder,
    safeCreateDirectory,
    verifyIfFileExists,
    getMimeTypeFromFilePath
}