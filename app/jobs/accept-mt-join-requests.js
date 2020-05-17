'use strict'
const { discordMessageJob } = require('./')
const { robloxManager } = require('../managers')
const { userService, groupService } = require('../services')

async function run (groupId, mtGroupId) {
    const client = robloxManager.getClient(mtGroupId)
    let cursor = null
    do {
        const requests = await client.apis.groups.getJoinRequests({ groupId: mtGroupId, cursor })
        for (const request of requests.data) {
            const userId = request.requester.userId
            const rank = await userService.getRank(userId, groupId)
            if (rank >= 100) {
                await client.apis.groups.acceptJoinRequest({ groupId: mtGroupId, userId })
                await groupService.setRank(mtGroupId, userId, rank)
                discordMessageJob.run('log', `Accepted **${request.requester.username}**'s MT join ` +
                    'request')
            } else {
                await client.apis.groups.declineJoinRequest({ groupId: mtGroupId, userId })
                discordMessageJob.run('log', `Declined **${request.requester.username}**'s MT join ` +
                    'request')
            }
        }
        cursor = requests.nextPageCursor
    } while (cursor)
}

module.exports = {
    run
}
