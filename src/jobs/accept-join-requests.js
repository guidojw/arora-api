'use strict'

const { Exile } = require('../models')

class AcceptJoinRequestsJob {
  constructor (discordMessageJob, healthCheckJob, robloxManager) {
    this._discordMessageJob = discordMessageJob
    this._healthCheckJob = healthCheckJob
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
        }
      }

      cursor = requests.nextPageCursor
    } while (cursor)

    await this._healthCheckJob.run('acceptJoinRequestsJob')
  }
}

module.exports = AcceptJoinRequestsJob
