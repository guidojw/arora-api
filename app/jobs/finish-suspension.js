'use strict'

const robloxConfig = require('../../config/roblox')

class FinishSuspensionJob {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  async run (suspension) {
    const rank = await this._userService.getRank(suspension.userId, robloxConfig.defaultGroup)

    if (rank !== 0) {
      await this._groupService.setRank(
        robloxConfig.defaultGroup,
        suspension.userId,
        suspension.rankBack && suspension.rank > 0 ? suspension.rank : 1)
    }
    suspension.update({ finished: true })

    const username = await this._userService.getUsername(suspension.userId)
    this._discordMessageJob.run(`Finished **${username}**'s suspension`)
  }
}

module.exports = FinishSuspensionJob
