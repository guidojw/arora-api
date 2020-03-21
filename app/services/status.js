'use strict'
const roblox = require('noblox.js')

exports.getStatus = async () => {
    try {
        await roblox.getCurrentUser()
        return true
    } catch (err) {
        return false
    }
}
