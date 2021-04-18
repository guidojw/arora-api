'use strict'

const pluralize = require('pluralize')

const { ConflictError, ForbiddenError, NotFoundError, UnprocessableError } = require('../errors')
const { hasScopes } = require('../util').requestUtil
const { inRange } = require('../util').util
const { Ban, BanCancellation, BanExtension } = require('../models')

const applicationConfig = require('../../config/application')

class BanService {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  getBans (groupId, scopes, sort) {
    if (!hasScopes(Ban, scopes)) {
      throw new UnprocessableError('Invalid scope.')
    }
    return Ban.scope(scopes ?? 'defaultScope').findAll({ where: { groupId }, order: sort })
  }

  async getBan (groupId, userId, scopes) {
    if (!hasScopes(Ban, scopes)) {
      throw new UnprocessableError('Invalid scope.')
    }
    const ban = await Ban.scope(scopes ?? 'defaultScope').findOne({ where: { groupId, userId } })
    if (!ban) {
      throw new NotFoundError('Ban not found.')
    }
    return ban
  }

  async ban (groupId, userId, { authorId, duration, reason }) {
    if (await Ban.findOne({ where: { groupId, userId } })) {
      throw new ConflictError('User is already banned.')
    }
    const role = await this._groupService.getRole(groupId, userId)
    if (applicationConfig.unbannableRanks.some(range => inRange(role.rank, range))) {
      throw new ForbiddenError('User\'s role is unbannable.')
    }

    const days = duration / (24 * 60 * 60 * 1000)
    if (days < 1) {
      throw new UnprocessableError('Insufficient amount of days.')
    }
    if (days > 7) {
      throw new UnprocessableError('Too many days.')
    }

    const ban = await Ban.create({
      authorId,
      duration: duration ?? null,
      groupId,
      reason,
      roleId: role.id,
      userId
    })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(ban.authorId),
      this._userService.getUsername(ban.userId)
    ])
    this._discordMessageJob.run(`**${authorName}** banned **${username}**${!isNaN(days) ? ` for **${pluralize('day', days, true)}**` : ''} with reason "*${ban.reason}*"`)

    return ban
  }

  async unban (groupId, userId, { authorId, reason }) {
    const ban = await this.getBan(groupId, userId)
    const cancellation = await BanCancellation.create({ banId: ban.id, authorId, reason })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(cancellation.authorId),
      this._userService.getUsername(ban.userId)
    ])
    this._discordMessageJob.run(`**${authorName}** unbanned **${username}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async extendBan (groupId, userId, { authorId, duration, reason }) {
    const ban = await this.getBan(groupId, userId)
    if (ban.duration === null) {
      throw new UnprocessableError('Ban is permanent.')
    }

    let newDuration = ban.duration
    newDuration += ban.extensions.reduce((result, extension) => result + extension.duration, 0)
    newDuration += duration
    const days = newDuration / (24 * 60 * 60 * 1000)
    if (days < 1) {
      throw new UnprocessableError('Insufficient amount of days.')
    }
    if (days > 7) {
      throw new UnprocessableError('Too many days.')
    }

    const extension = await BanExtension.create({
      authorId,
      banId: ban.id,
      duration,
      reason
    })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(extension.authorId),
      this._userService.getUsername(ban.userId)
    ])
    const extensionDays = extension.duration / (24 * 60 * 60 * 1000)
    this._discordMessageJob.run(`**${authorName}** extended **${username}**'s ban with **${pluralize('day', extensionDays, true)}**`)

    return extension
  }

  async changeBan (groupId, userId, { changes, editorId }) {
    let ban = await this.getBan(groupId, userId)
    ban = await ban.update(changes)

    const [editorName, username] = await Promise.all([
      this._userService.getUsername(editorId),
      this._userService.getUsername(ban.userId)
    ])
    if (changes.authorId) {
      const authorName = await this._userService.getUsername(ban.authorId)
      this._discordMessageJob.run(`**${editorName}** changed the author of **${username}**'s ban to **${authorName}**`)
    }
    if (changes.reason) {
      this._discordMessageJob.run(`**${editorName}** changed the reason of **${username}**'s ban to *"${ban.reason}"*`)
    }

    return ban
  }
}

module.exports = BanService
