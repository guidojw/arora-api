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

    try {
        const client = new Client({
            setup: {
                throwHttpErrors: true
            }, credentials: {
                cookie: process.env.ROBLOX_COOKIE
            }
        })

        await client.login()
        console.log('Roblox account logged in!')

        const groups = await client.user.getGroups()
        const groupIds = groups.data.map(group => group.id)
        for (const groupId of groupIds) {
            clients.authenticated[groupId] = client
        }

    } catch (err) {
        console.error(err.message)
    }

    clients.unauthenticated = new Client({
        setup: {
            throwHttpErrors: true
        }
    })

    checkSuspensionsJob()
    announceTrainingsJob(robloxConfig.defaultGroup)
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}
