'use strict'
const { Exile, Suspension } = require('../models')

class AcceptJoinRequestsJob {
  constructor (robloxManager, groupService, discordMessageJob) {
    this._robloxManager = robloxManager
    this._groupService = groupService
    this._discordMessageJob = discordMessageJob
  }

  async run (groupId) {
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)

    let cursor = null
    do {
      const requests = await group.getJoinRequests({ cursor })
      for (const request of requests.data) {
        const userId = request.requester.userId

        if (await Exile.findOne({ where: { userId } })) {
          await group.declineJoinRequest(userId)
          this._discordMessageJob.run('log', `Declined **${request.requester.username}**'s join request`)
        } else {
          await group.acceptJoinRequest(userId)
          this._discordMessageJob.run('log', `Accepted **${request.requester.username}**'s join request`)
          if (await Suspension.findOne({ where: { userId } })) {
            await this._groupService.setRank(groupId, userId, 2)
            this._discordMessageJob.run('log', `Promoted **${request.requester.username}** from **Customer** to **Suspended**`)
          }
        }
      }

      cursor = requests.nextPageCursor
    } while (cursor)
  }
}

module.exports = AcceptJoinRequestsJob
