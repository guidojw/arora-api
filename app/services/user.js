'use strict'
const roblox = require('noblox.js')
const axios = require('axios')

exports.getUserId = async username => {
    return await roblox.getIdFromUsername(username)
}

exports.getJoinDate = async userId => {
    return (await axios({
        method: 'get',
        url: `https://users.roblox.com/v1/users/${userId}`,
    })).data.created
}
