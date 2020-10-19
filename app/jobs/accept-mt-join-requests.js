'use strict'
const discordMessageJob = require('./discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const groupService = require('../services/group')

module.exports = async (groupId, mtGroupId) => {
    const client = robloxManager.getClient(mtGroupId)
    const mtGroup = await client.getGroup(mtGroupId)
    let cursor = null
    do {
        const requests = await mtGroup.getJoinRequests({ cursor })

        for (const request of requests.data) {
            const userId = request.requester.userId
            const rank = await userService.getRank(userId, groupId)

            if (rank >= 100) {
                await mtGroup.acceptJoinRequest(userId)
                await groupService.setRank(mtGroupId, userId, rank)
                discordMessageJob('log', `Accepted **${request.requester.username}**'s MT join request`)

            } else {
                await mtGroup.declineJoinRequest(userId)
                discordMessageJob('log', `Declined **${request.requester.username}**'s MT join request`)
            }
        }

        cursor = requests.nextPageCursor
    } while (cursor)
}
