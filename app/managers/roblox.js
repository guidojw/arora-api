'use strict'
require('dotenv').config()

const { Client } = require('bloxy')
const checkSuspensionsJob = require('../jobs/check-suspensions')
const announceTrainingsJob = require('../jobs/announce-trainings')

const robloxConfig = require('../../config/roblox')

const clients = { authenticated: {} }

let initiated = false

exports.init = async () => {
    if (initiated) return
    initiated = true

    // Authenticated client(s)
    try {
        const client = new Client({
            credentials: {
                cookie: process.env.ROBLOX_COOKIE
            }
        })
        // Set the client's requester to the custom requester.
        client.rest.requester = requester.bind(client.rest.requester)

        await client.login()
        console.log('Roblox account logged in!')

        const groups = await client.user.getGroups()
        const groupIds = groups.data.map(group => group.group.id)
        for (const groupId of groupIds) {
            clients.authenticated[groupId] = client
        }

    } catch (err) {
        console.error(err.message)
    }

    // Unauthenticated client
    const client = new Client()
    client.rest.requester = requester.bind(client.rest.requester)
    clients.unauthenticated = client

    checkSuspensionsJob()
    announceTrainingsJob(robloxConfig.defaultGroup)
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}

// Custom requester that uses Bloxy's default requester but
// enables its throwHttpErrors as the project relies on that.
async function requester(options) {
    if (options.xcsrf !== false && options.url !== 'https://auth.roblox.com/v2/login') {
        options.throwHttpErrors = true
    }

    // this refers to Bloxy's original requester.
    return this(options)
}
