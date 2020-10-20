'use strict'
const discordMessageJob = require('./discord-message')
const groupService = require('../services/group')
const robloxManager = require('../managers/roblox')
const { Exile, Suspension } = require('../models')

module.exports = async groupId => {
    const client = robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    let cursor = null
    do {
        const requests = await group.getJoinRequests({ cursor })

        for (const request of requests.data) {
            const userId = request.requester.userId

            if (await Exile.findOne({ where: { userId }})) {
                await group.declineJoinRequest(userId)
                discordMessageJob('log', `Declined **${request.requester.username}**'s join request`)

            } else {
                await group.acceptJoinRequest(userId)
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
