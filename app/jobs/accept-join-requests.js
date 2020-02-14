'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message')

const groupService = require('../services/group')

class AcceptJoinRequestsJob {
    perform = async groupId => {
        try {
            const exiles = await groupService.getExiles()
            const suspensions = await groupService.getSuspensions()
            const requests = await roblox.getJoinRequests(groupId)
            for (const request of requests.data) {
                const userId = request.requester.userId
                if (exiles.find(exile => exile.userId === userId)) {
                    await roblox.handleJoinRequest(groupId, userId, false)
                    await (new DiscordMessageJob()).perform('log', `Declined **${request.requester
                            .username}**'s join request`)
                } else {
                    await roblox.handleJoinRequest(groupId, userId, true)
                    await (new DiscordMessageJob()).perform('log', `Accepted **${request.requester
                            .username}**'s join request`)
                    if (suspensions.find(suspension => suspension.userId === userId)) {
                        await roblox.setRank(groupId, userId, 2)
                        await (new DiscordMessageJob()).perform('log', `Promoted **${request.requester
                            .username}** from **Customer** to **Suspended**`)
                    }
                }
            }
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = AcceptJoinRequestsJob
