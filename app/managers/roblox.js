'use strict'
require('dotenv').config()

const { Client } = require('bloxy')
const { checkSuspensionsJob } = require('../jobs')

const clients = { authenticated: {} }

let initiated = false

async function init () {
    if (initiated) return
    initiated = true
    try {
        const client = new Client({ setup: { throwHttpErrors: true }})
        await client.login({ cookie: process.env.ROBLOX_COOKIE })
        console.log('Roblox account logged in!')
        const groups = await client.user.getGroups()
        const groupIds = groups.map(group => group.id)
        for (const groupId of groupIds) {
            clients.authenticated[groupId] = client
        }
    } catch (err) {
        console.error(err.message)
    }
    clients.unauthenticated = new Client({ setup: { throwHttpErrors: true }})

    checkSuspensionsJob()
}

function getClient (groupId) {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}

module.exports = {
    init,
    getClient
}
