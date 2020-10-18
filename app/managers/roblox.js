'use strict'
require('dotenv').config()

const { Client } = require('bloxy')
const checkSuspensionsJob = require('../jobs/check-suspensions')
const announceTrainingsJob = require('../jobs/announce-trainings')
const axios = require('axios')

const robloxConfig = require('../../config/roblox')

const clients = { authenticated: {} }

let initiated = false

exports.init = async () => {
    if (initiated) return
    initiated = true

    try {
        const client = new Client({
            rest: {
                // Bloxy's default requester (got) doesn't throw HTTP errors,
                // so this custom requester is used which does.
                requester
            },
            credentials: {
                cookie: process.env.ROBLOX_COOKIE
            }
        })

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

    clients.unauthenticated = new Client({ rest: { requester }})

    checkSuspensionsJob()
    announceTrainingsJob(robloxConfig.defaultGroup)
}

exports.getClient = groupId => {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}

// Custom requester for Bloxy using Axios.
async function requester(options) {
    let result
    try {
        result = await axios.request(options)

    } catch (err) {
        // Map status and statusText to corresponding
        // statusCode and message in thrown error.
        err.statusCode = err.response.status
        err.message = err.response.statusText

        throw err
    }

    // Bloxy expects (the very odd) got's format for response data,
    // so map two variables to keep Bloxy responseHandlers from breaking.
    result.statusCode = result.status
    result.body = result.data

    return result
}
