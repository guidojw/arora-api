'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('../jobs/discord-message-job')

class AcceptJoinRequestsJob {
    perform = async (groupId, mtGroupId) => {
        try {
            const requests = await roblox.getJoinRequests(groupId)
            for (const request of requests) {
                const userId = await roblox.getIdFromUsername(request.username)
                const rank = await roblox.getRankInGroup(groupId, userId)
                if (rank >= 100) {
                    await roblox.handleJoinRequestId(mtGroupId, request.requestId, true)
                    await roblox.setRank(mtGroupId, userId, rank)
                    new DiscordMessageJob().perform('log', `Accepted **${request.username}**'s MT ` +
                        'join request')
                } else {
                    await roblox.handleJoinRequestId(mtGroupId, request.requestId, false)
                    new DiscordMessageJob().perform('log', `Declined **${request.username}**'s MT ` +
                        'join request')
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = AcceptJoinRequestsJob
