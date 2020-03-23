'use strict'
const robloxManager = require('../managers/roblox')
const axios = require('axios')

const robloxConfig = require('../../config/roblox')

exports.getUserId = username => {
    const client = robloxManager.getClient()
    return client.getUserId(username)
}

exports.getJoinDate = async userId => {
    const client = robloxManager.getClient()
    const info = await client.apis.users.getUserInfo(userId)
    return info.created
}

exports.hasBadge = async (userId, badgeId) => {
    const client = robloxManager.getClient(robloxConfig.defaultGroup)
    return (await client.apis.inventory.getUserOwnedItems({
        userId,
        itemType: 'Badge',
        targetId: badgeId
    })).data.length === 1
}

exports.getUsers = async (userIds, excludeBannedUsers) => {
    return (await axios({
        method: 'post',
        url: 'https://users.roblox.com/v1/users',
        data: { userIds, excludeBannedUsers }
    })).data
}

exports.getRank = async (userId, groupId) => {
    const client = robloxManager.getClient()
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.find(group => group.id === groupId)
    return group ? group.role.rank : 0
}

exports.getRole = async (userId, groupId) => {
    const client = robloxManager.getClient()
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.find(group => group.id === groupId)
    return group ? group.role.name : 'Guest'
}

exports.getUsername = userId => {
    const client = robloxManager.getClient()
    return client.getUsername(userId)
}
