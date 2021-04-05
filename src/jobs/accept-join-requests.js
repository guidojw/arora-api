'use strict'

const { Exile, Suspension } = require('../models')

class AcceptJoinRequestsJob {
  constructor (discordMessageJob, groupService, robloxManager) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._robloxManager = robloxManager
  }

  async run (groupId) {
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)

    let cursor = null
    do {
      const requests = await group.getJoinRequests({ cursor })
      for (const request of requests.data) {
        const userId = request.requester.userId

        if (await Exile.findOne({ where: { groupId, userId } })) {
          await group.declineJoinRequest(userId)
          this._discordMessageJob.run(`Declined **${request.requester.username}**'s join request`)
        } else {
          await group.acceptJoinRequest(userId)
          this._discordMessageJob.run(`Accepted **${request.requester.username}**'s join request`)

          if (await Suspension.findOne({ where: { groupId, userId } })) {
            await this._groupService.setMemberRank(groupId, userId, 2)
            this._discordMessageJob.run(`Promoted **${request.requester.username}** from **Customer** to **Suspended**`)
          }
        }
      }

      cursor = requests.nextPageCursor
    } while (cursor)
  }
}

module.exports = AcceptJoinRequestsJob
