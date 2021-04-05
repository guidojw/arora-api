'use strict'

const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')
const { inRange } = require('../helpers').dataHelper
const { Exile } = require('../models')

const applicationConfig = require('../../config/application')

class ExileService {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  getExiles (_groupId) {
    return Exile.findAll()
  }

  async getExile (groupId, userId) {
    const exile = await Exile.findOne({ where: { groupId, userId } })
    if (!exile) {
      throw new NotFoundError('Exile not found.')
    }
    return exile
  }

  async exile (groupId, userId, { authorId }) {
    if (await Exile.findOne({ where: { groupId, userId } })) {
      throw new ConflictError('User is already exiled.')
    }
    const rank = await this._userService.getRank(userId, groupId)
    if (applicationConfig.unexilableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('Cannot exile members on this rank.')
    }

    try {
      await this._groupService.kickMember(groupId, userId)
    } catch (err) {} // eslint-disable-line no-empty
    const exile = await Exile.create({ groupId, userId })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(exile.userId),
      this._userService.getUsername(authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** exiled **${username}**`)

    return exile
  }

  async unexile (groupId, userId, { authorId }) {
    const exile = await this.getExile(groupId, userId)
    await exile.destroy()

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(exile.userId),
      this._userService.getUsername(authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** unexiled **${username}**`)

    return exile
  }
}

module.exports = ExileService
