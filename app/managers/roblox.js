'use strict'
require('dotenv').config()

const { Client } = require('bloxy')

const clients = { authenticated: {} }

exports.init = async () => {
    try {
        const client = new Client()
        await client.login({ cookie: process.env.ROBLOX_COOKIE })
        const groups = await client.user.getGroups()
        const groupIds = groups.map(group => group.id)
        for (const groupId of groupIds) {
            clients.authenticated[groupId] = client
        }
    } catch (err) {
        console.error(err.message)
    }
    clients.unauthenticated = new Client()
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}
