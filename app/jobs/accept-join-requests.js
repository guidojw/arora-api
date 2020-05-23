'use strict'
const discordMessageJob = require('./discord-message')
const groupService = require('../services/group')
const robloxManager = require('../managers/roblox')
const { Exile, Suspension } = require('../models')

module.exports = async groupId => {
    const client = robloxManager.getClient(groupId)
    let cursor = null
    do {
        const requests = await client.apis.groups.getJoinRequests({ groupId, cursor })
        for (const request of requests.data) {
            const userId = request.requester.userId
            if (await Exile.findOne({ where: { userId }})) {
                await client.apis.groups.declineJoinRequest({ groupId, userId })
                discordMessageJob('log', `Declined **${request.requester.username}**'s join request`)
            } else {
                await client.apis.groups.acceptJoinRequest({ groupId, userId })
                discordMessageJob('log', `Accepted **${request.requester.username}**'s join request`)
                if (await Suspension.findOne({ where: { userId }})) {
                    await groupService.setRank(groupId, userId, 2)
                    discordMessageJob('log', `Promoted **${request.requester.username}** from **` +
                        'Customer** to **Suspended**')
                }
            }
        }
        cursor = requests.nextPageCursor
    } while (cursor)
}
