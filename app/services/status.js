'use strict'
const robloxManager = require('../managers/roblox')
const NotFoundError = require('../errors/not-found')

exports.getStatus = groupId => {
    const client = robloxManager.getClient(groupId)
    if (!client) {
        throw new NotFoundError('Client not found.')
    }

    return client.loggedIn
}
