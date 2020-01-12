'use strict'
const roblox = require('noblox.js')

exports.getStatus = async () => {
    await roblox.getCurrentUser()
    return true
}
