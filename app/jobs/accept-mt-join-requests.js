'use strict'
class AcceptMtJoinRequestsJob {
    constructor(robloxManager, userService, groupService, discordMessageJob) {
        this._robloxManager = robloxManager
        this._userService = userService
        this._groupService = groupService
        this._discordMessageJob = discordMessageJob
    }

    async run(groupId, mtGroupId) {
        const client = this._robloxManager.getClient(mtGroupId)
        const mtGroup = await client.getGroup(mtGroupId)

        let cursor = null
        do {
            const requests = await mtGroup.getJoinRequests({ cursor })
            for (const request of requests.data) {
                const userId = request.requester.userId
                const rank = await this._userService.getRank(userId, groupId)

                if (rank >= 100) {
                    await mtGroup.acceptJoinRequest(userId)
                    await this._groupService.setRank(mtGroupId, userId, rank)
                    this._discordMessageJob.run('log', `Accepted **${request.requester.username}**'s MT join request`)

                } else {
                    await mtGroup.declineJoinRequest(userId)
                    this._discordMessageJob.run('log', `Declined **${request.requester.username}**'s MT join request`)
                }
            }

            cursor = requests.nextPageCursor
        } while (cursor)
    }
}

module.exports = AcceptMtJoinRequestsJob
