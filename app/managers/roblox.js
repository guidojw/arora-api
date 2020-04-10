'use strict'
require('dotenv').config()

const { Client } = require('bloxy')

const clients = { authenticated: {} }

exports.init = async () => {
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
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}
