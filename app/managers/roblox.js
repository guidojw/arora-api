'use strict'
require('dotenv').config()

const { Client } = require('bloxy')
const models = require('../models')
const cron = require('node-schedule')
const finishSuspensionJob = require('../jobs/finish-suspension')
const checkSuspensionsJob = require('../jobs/check-suspensions')

const robloxConfig = require('../../config/roblox')

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

    checkSuspensionsJob(robloxConfig.defaultGroup)
    for (const suspension in await models.Suspension.findAll()) {
        cron.scheduleJob(suspension.endDate, finishSuspensionJob.bind(null, suspension))
    }
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}
