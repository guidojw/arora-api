'use strict'
const userService = require('../services/user')
const groupService = require('../services/group')
const discordMessageJob = require('./discord-message')
const models = require('../models')

const robloxConfig = require('../../config/roblox')

module.exports = async suspension => {
    if (!models.SuspensionCancellation.findOne({ where: { suspensionId: suspension.id }})) {
        const rank = await userService.getRank(suspension.userId, robloxConfig.defaultGroup)
        if (rank !== 0) {
            await groupService.setRank(robloxConfig.defaultGroup, suspension.userId, suspension.rankBack ?
                suspension.rank : 1)
        }
        const username = await userService.getUsername(suspension.userId)
        await discordMessageJob('log', `Finished **${username}**'s suspension`)
    }
}