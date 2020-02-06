'use strict'
const roblox = require('noblox.js')
const axios = require('axios')

exports.getUserId = async username => {
    return await roblox.getIdFromUsername(username)
}

exports.getJoinDate = async userId => {
    return (await axios({
        method: 'get',
        url: `https://users.roblox.com/v1/users/${userId}`
    })).data.created
}

exports.hasBadge = async (userId, badgeId) => {
    return (await axios({
        method: 'get',
        url: `https://inventory.roblox.com/v1/users/${userId}/items/Badge/${badgeId}`
    })).data.data.length === 1
}
