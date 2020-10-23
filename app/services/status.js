'use strict'
const robloxManager = require('../managers/roblox')
const NotFoundError = require('../errors/not-found')

async function getStatus(groupId) {
    const client = robloxManager.getClient(groupId)
    if (!client) {
        throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return authenticationData !== undefined
}

module.exports = {
    getStatus
}
