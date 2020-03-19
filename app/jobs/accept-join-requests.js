'use strict'
const discordMessageJob = require('./discord-message')
const groupService = require('../services/group')
const robloxManager = require('../managers/roblox')

module.exports = async groupId => {
    const exiles = await groupService.getExiles()
    const suspensions = await groupService.getSuspensions()
    const roles = await groupService.getRoles(groupId)
    const client = robloxManager.getClient(groupId)
    let cursor = null
    do {
        const requests = await client.apis.groups.getJoinRequests({ groupId, cursor })
        for (const request of requests.data) {
            const userId = request.requester.userId
            if (exiles.find(exile => exile.userId === userId)) {
                await client.apis.groups.declineJoinRequest({ groupId, userId })
                await discordMessageJob('log', `Declined **${request.requester.username}**'s join ` +
                    'request')
            } else {
                await client.apis.groups.acceptJoinRequest({ groupId, userId })
                await discordMessageJob('log', `Accepted **${request.requester.username}**'s join ` +
                    'request')
                if (suspensions.find(suspension => suspension.userId === userId)) {
                    const roleId = roles.roles.find(role => role.rank === 2).id
                    await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId })
                    await discordMessageJob('log', `Promoted **${request.requester.username}** from ` +
                        '**Customer** to **Suspended**')
                }
            }
        }
        cursor = requests.nextPageCursor
    } while (cursor)
}
