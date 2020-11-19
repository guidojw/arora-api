'use strict'
const { Ban, BanCancellation } = require('../models')
const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')

const robloxConfig = require('../../config/roblox')

class BanService {
  constructor (userService, discordMessageJob) {
    this._userService = userService
    this._discordMessageJob = discordMessageJob
  }

  getBans (scope, sort) {
    return Ban.scope(scope || 'defaultScope').findAll({ order: sort })
  }

  async getBan (userId, scope) {
    const ban = await Ban.scope(scope || 'defaultScope').findOne({ where: { userId } })
    if (!ban) {
      throw new NotFoundError('Ban not found.')
    }
    return ban
  }

  async ban (groupId, userId, { authorId, reason }) {
    if (await Ban.findOne({ where: { userId } })) {
      throw new ConflictError('User is already banned.')
    }

    const rank = await this._userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) {
      throw new ForbiddenError('User is unbannable.')
    }

    const ban = await Ban.create({
      authorId,
      reason,
      userId,
      rank
    })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(ban.userId),
      this._userService.getUsername(ban.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** banned **${username}** with reason "*${ban.reason}*"`)

    return ban
  }

  async cancelBan (userId, authorId, reason) {
    if (authorId !== robloxConfig.ownerId) {
      throw new ForbiddenError('Only the owner can unban.')
    }

    const ban = await this.getBan(userId)
    const cancellation = await BanCancellation.create({ banId: ban.id, authorId, reason })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(ban.userId),
      this._userService.getUsername(cancellation.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** unbanned **${username}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async changeBan (userId, { changes, editorId }) {
    let ban = await this.getBan(userId)
    ban = await ban.update(changes, { editorId })

    const [username, editorName] = await Promise.all([
      this._userService.getUsername(ban.userId),
      this._userService.getUsername(editorId)
    ])
    if (changes.reason) {
      this._discordMessageJob.run(`**${editorName}** changed the reason of **${username}**'s ban to *"${ban.reason}"*`)
    }
    if (changes.authorId) {
      const authorName = await this._userService.getUsername(ban.authorId)
      this._discordMessageJob.run(`**${editorName}** changed the author of **${username}**'s ban to **${authorName}**`)
    }

    return ban
  }
}

module.exports = BanService
