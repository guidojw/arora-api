'use strict'

class FinishSuspensionJob {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  async run (suspension) {
    const rank = await this._userService.getRank(suspension.userId, suspension.groupId)

    if (rank !== 0) {
      await this._groupService.setMemberRole(
        suspension.groupId,
        suspension.userId,
        suspension.rankBack && suspension.rank > 0 ? suspension.rank : 1)
    }

    const username = await this._userService.getUsername(suspension.userId)
    this._discordMessageJob.run(`Finished **${username}**'s suspension`)
  }
}

module.exports = FinishSuspensionJob
