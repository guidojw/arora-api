'use strict'
const robloxManager = require('../managers/roblox')
const NotFoundError = require('../errors/not-found')

exports.getStatus = async groupId => {
    const client = robloxManager.getClient(groupId)
    if (!client) {
        throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return authenticationData !== undefined
}
