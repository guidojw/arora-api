'use strict'
const robloxManager = require('../managers/roblox')
const NotFoundError = require('../errors/not-found')

const robloxConfig = require('../../config/roblox')

exports.getUserIdFromUsername = async username => {
    const client = robloxManager.getClient()
    const user = await client.getUserIdFromUsername(username)

    // This Roblox endpoint doesn't throw HTTP 404 if a user doesn't exist..
    if (user.id === undefined) {
        throw new NotFoundError('User not found')
    }

    return user.id
}

exports.hasBadge = async (userId, badgeId) => {
    const client = robloxManager.getClient(robloxConfig.defaultGroup)
    return (await client.apis.inventoryAPI.getUserItemsByTypeAndTargetId({
        userId,
        itemType: 'Badge',
        itemTargetId: badgeId
    })).data.length === 1
}

exports.getUsers = async userIds => {
    const client = robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
}

exports.getRank = async (userId, groupId) => {
    const client = robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    return group ? group.role.rank : 0
}

exports.getRole = async (userId, groupId) => {
    const client = robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    return group ? group.role.name : 'Guest'
}

exports.getUsername = async userId => {
    return (await this.getUser(userId)).name
}

exports.getUser = userId => {
    const client = robloxManager.getClient()
    return client.apis.usersAPI.getUserById({ userId })
}
