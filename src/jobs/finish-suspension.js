'use strict'

class FinishSuspensionJob {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  async run (suspension) {
    const role = await this._userService.getRole(suspension.userId, suspension.groupId)

    if (role.rank !== 0) {
      try {
        await this._groupService.setMemberRole(
          suspension.groupId,
          suspension.userId,
          suspension.roleBack ? suspension.roleId : 1)
      } catch {
        await this._groupService.setMemberRole(suspension.groupId, suspension.userId, 1)
      }
    }

    const username = await this._userService.getUsername(suspension.userId)
    this._discordMessageJob.run(`Finished **${username}**'s suspension`)
  }
}

module.exports = FinishSuspensionJob
