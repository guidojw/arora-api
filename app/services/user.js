'use strict'
const { robloxManager } = require('../managers')

const robloxConfig = require('../../config/roblox')

function getUserId (username) {
    const client = robloxManager.getClient()
    return client.getUserId(username)
}

async function hasBadge (userId, badgeId) {
    const client = robloxManager.getClient(robloxConfig.defaultGroup)
    return (await client.apis.inventory.getUserOwnedItems({
        userId,
        itemType: 'Badge',
        targetId: badgeId
    })).data.length === 1
}

async function getUsers (userIds) {
    const client = robloxManager.getClient()
    return (await client.apis.users.getUsersByIds(userIds)).data
}

async function getRank (userId, groupId) {
    const client = robloxManager.getClient()
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.find(group => group.id === groupId)
    return group ? group.role.rank : 0
}

async function getRole (userId, groupId) {
    const client = robloxManager.getClient()
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.find(group => group.id === groupId)
    return group ? group.role.name : 'Guest'
}

function getUsername (userId) {
    const client = robloxManager.getClient()
    return client.getUsername(userId)
}

function getUser (userId) {
    const client = robloxManager.getClient()
    return client.apis.users.getUserInfo(userId)
}

module.exports = {
    getUserId,
    hasBadge,
    getUsers,
    getRank,
    getRole,
    getUsername,
    getUser
}
