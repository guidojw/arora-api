'use strict'
const roblox = require('noblox.js')
const discordMessageJob = require('./discord-message')

module.exports = async (groupId, mtGroupId) => {
    let cursor = null
    do {
        const requests = await roblox.getJoinRequests({
            group: mtGroupId,
            cursor: cursor
        })
        for (const request of requests.data) {
            const userId = request.requester.userId
            const rank = await roblox.getRankInGroup(groupId, userId)
            if (rank >= 100) {
                await roblox.handleJoinRequest(mtGroupId, userId, true)
                await roblox.setRank(mtGroupId, userId, rank)
                await discordMessageJob('log', `Accepted **${request.requester.username}**'s MT join ` +
                    'request')
            } else {
                await roblox.handleJoinRequest(mtGroupId, userId, false)
                await discordMessageJob('log', `Declined **${request.requester.username}**'s MT join ` +
                    'request')
            }
        }
        cursor = requests.nextPageCursor
    } while (cursor)
}
