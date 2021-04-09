'use strict'

const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')
const { inRange } = require('../util').util
const { Ban, BanCancellation } = require('../models')

const applicationConfig = require('../../config/application')

class BanService {
  constructor (discordMessageJob, userService) {
    this._discordMessageJob = discordMessageJob
    this._userService = userService
  }

  getBans (groupId, scope, sort) {
    return Ban.scope(scope ?? 'defaultScope').findAll({ where: { groupId }, order: sort })
  }

  async getBan (groupId, userId, scope) {
    const ban = await Ban.scope(scope ?? 'defaultScope').findOne({ where: { groupId, userId } })
    if (!ban) {
      throw new NotFoundError('Ban not found.')
    }
    return ban
  }

  async ban (groupId, userId, { authorId, reason }) {
    if (await Ban.findOne({ where: { groupId, userId } })) {
      throw new ConflictError('User is already banned.')
    }
    const rank = await this._userService.getRank(userId, groupId)
    if (applicationConfig.unbannableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('User\'s rank is unbannable.')
    }

    const ban = await Ban.create({
      groupId,
      authorId,
      userId,
      rank,
      reason
    })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(ban.userId),
      this._userService.getUsername(ban.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** banned **${username}** with reason "*${ban.reason}*"`)

    return ban
  }

  async unban (groupId, userId, { authorId, reason }) {
    const ban = await this.getBan(groupId, userId)
    const cancellation = await BanCancellation.create({ banId: ban.id, authorId, reason })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(ban.userId),
      this._userService.getUsername(cancellation.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** unbanned **${username}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async changeBan (groupId, userId, { changes, editorId }) {
    let ban = await this.getBan(groupId, userId)
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
