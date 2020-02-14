'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message')

class AcceptMtJoinRequestsJob {
    perform = async (groupId, mtGroupId) => {
        try {
            const requests = await roblox.getJoinRequests(mtGroupId)
            for (const request of requests.data) {
                const userId = request.requester.userId
                const rank = await roblox.getRankInGroup(groupId, userId)
                if (rank >= 100) {
                    await roblox.handleJoinRequest(mtGroupId, userId, true)
                    await roblox.setRank(mtGroupId, userId, rank)
                    await (new DiscordMessageJob()).perform('log', `Accepted **${request.requester
                            .username}**'s MT join request`)
                } else {
                    await roblox.handleJoinRequest(mtGroupId, userId, false)
                    await (new DiscordMessageJob()).perform('log', `Declined **${request.requester
                            .username}**'s MT join request`)
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = AcceptMtJoinRequestsJob
