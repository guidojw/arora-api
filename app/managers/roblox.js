'use strict'
require('dotenv').config()

const { Client } = require('bloxy')

const clients = {}

exports.init = async () => {
    const client = new Client()
    await client.login({ cookie: process.env.ROBLOX_COOKIE })
    clients[client.id] = client
    clients.noAuth = new Client()
}

exports.getClient = userId => {
    return clients[userId]
}
