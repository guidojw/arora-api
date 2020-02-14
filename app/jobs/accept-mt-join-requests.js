'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message')

class AcceptJoinRequestsJob {
    perform = async (groupId, mtGroupId) => {
        try {
            const requests = await roblox.getJoinRequests(mtGroupId)
            for (const request of requests) {
                const userId = await roblox.getIdFromUsername(request.username)
                const rank = await roblox.getRankInGroup(groupId, userId)
                if (rank >= 100) {
                    await roblox.handleJoinRequest(mtGroupId, request.username, true)
                    await roblox.setRank(mtGroupId, userId, rank)
                    await (new DiscordMessageJob()).perform('log', `Accepted **${request.username}**` +
                        '\'s MT join request')
                } else {
                    await roblox.handleJoinRequest(mtGroupId, request.username, false)
                    await (new DiscordMessageJob()).perform('log', `Declined **${request.username}**` +
                        '\'s MT join request')
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = AcceptJoinRequestsJob
