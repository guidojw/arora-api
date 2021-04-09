'use strict'

const { ForbiddenError, NotFoundError } = require('../errors')
const { inRange } = require('../util').util

const applicationConfig = require('../../config/application')

class GroupService {
  constructor (discordMessageJob, robloxManager, userService, webSocketManager) {
    this._discordMessageJob = discordMessageJob
    this._robloxManager = robloxManager
    this._userService = userService
    this._webSocketManager = webSocketManager
  }

  async getShout (groupId) {
    const group = await this.getGroup(groupId)
    return group.shout
  }

  getGroup (groupId) {
    const client = this._robloxManager.getClient(groupId)
    return client.apis.groupsAPI.getGroup({ groupId })
  }

  getRoles (groupId) {
    const client = this._robloxManager.getClient(groupId)
    return client.apis.groupsAPI.getGroupRoles({ groupId })
  }

  async shout (groupId, message, authorId) {
    const client = this._robloxManager.getClient(groupId)
    const shout = await client.apis.groupsAPI.updateGroupStatus({ groupId, message })

    if (authorId) {
      const authorName = await this._userService.getUsername(authorId)
      if (shout.body === '') {
        this._discordMessageJob.run(`**${authorName}** cleared the shout`)
      } else {
        this._discordMessageJob.run(`**${authorName}** shouted "*${shout.body}*"`)
      }
    }

    return shout
  }

  async setMemberRole (groupId, userId, role) {
    if (typeof role === 'number') {
      const roles = await this.getRoles(groupId)
      role = roles.roles.find(otherRole => otherRole.rank === role)
      if (!role) {
        throw new NotFoundError('Role not found.')
      }
    }
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.updateMember(userId, role.id)

    this._webSocketManager.broadcast('rankChange', { groupId, rank: role.rank, userId })

    return role
  }

  async changeMemberRole (groupId, userId, { role, authorId }) {
    const oldRole = await this._userService.getRole(userId, groupId)
    if ([0, 255].includes(oldRole.rank)) {
      throw new ForbiddenError('Cannot promote members on this role.')
    }

    const newRole = await this.setMemberRole(groupId, userId, role)
    const username = await this._userService.getUsername(userId)
    if (oldRole.id !== newRole.id) {
      if (typeof authorId !== 'undefined') {
        const authorName = await this._userService.getUsername(authorId)
        this._discordMessageJob.run(`**${authorName}** changed **${username}**'s role from **${oldRole.name}** to **${newRole.name}**`)
      } else {
        this._discordMessageJob.run(`Changed **${username}**'s role from **${oldRole.name}** to **${newRole.name}**`)
      }
    }

    return { oldRole, newRole }
  }

  async promoteMember (groupId, userId, authorId) {
    const rank = await this._userService.getRank(userId, groupId)
    if ([0, 255].includes(rank) || applicationConfig.unpromotableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('Cannot promote members on this role.')
    }
    const roles = await this.getRoles(groupId)
    const role = roles.roles
      .sort((roleA, roleB) => roleA.rank - roleB.rank)
      .slice(roles.roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => inRange(role.rank, range)))
    if (!role || role.rank === 255) {
      throw new ForbiddenError('Member is already the highest obtainable role.')
    }
    return this.changeMemberRole(groupId, userId, { role, authorId })
  }

  async demoteMember (groupId, userId, authorId) {
    const rank = await this._userService.getRank(userId, groupId)
    if ([0, 255].includes(rank) || applicationConfig.undemotableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('Cannot demote members on this role.')
    }
    const roles = await this.getRoles(groupId)
    const role = roles.roles
      .sort((roleA, roleB) => roleB.rank - roleA.rank)
      .slice(roles.roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => inRange(role.rank, range)))
    if (!role || role.rank === 0) {
      throw new ForbiddenError('Member is already the lowest obtainable role.')
    }
    return this.changeMemberRole(groupId, userId, { role, authorId })
  }

  async kickMember (groupId, userId) {
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.kickMember(userId)

    this._webSocketManager.broadcast('rankChange', { groupId, userId, rank: 0 })
  }
}

module.exports = GroupService
