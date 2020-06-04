const fs = require('fs')

module.exports.get = () => {
    try {
        let file = fs.readFileSync(__dirname + '\\services-table.json', { encoding: 'utf-8' })
        return JSON.parse(file)
    } catch (error) {
        console.log(error)
        return {}
    }
}