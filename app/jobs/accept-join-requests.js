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
            for (const request of requests) {
                const userId = await roblox.getIdFromUsername(request.username)
                if (exiles.find(exile => exile.userId === userId)) {
                    await roblox.handleJoinRequest(groupId, request.username, false)
                    await (new DiscordMessageJob()).perform('log', `Declined **${request.username}**` +
                        '\'s join request')
                } else {
                    await roblox.handleJoinRequest(groupId, request.username, true)
                    await (new DiscordMessageJob()).perform('log', `Accepted **${request.username}**` +
                        '\'s join request')
                    if (suspensions.find(suspension => suspension.userId === userId)) {
                        await roblox.setRank(groupId, userId, 2)
                        await (new DiscordMessageJob()).perform('log', `Promoted **` +
                            `${request.username}** from **Customer** to **Suspended**`)
                    }
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = AcceptJoinRequestsJob
