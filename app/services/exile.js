'use strict'
const { Exile } = require('../models')
const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')

class ExileService {
  constructor (discordMessageJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._groupService = groupService
    this._userService = userService
  }

  getExiles (_groupId) {
    return Exile.findAll()
  }

  async getExile (_groupId, userId) {
    const exile = await Exile.findOne({ where: { userId } })
    if (!exile) {
      throw new NotFoundError('Exile not found.')
    }
    return exile
  }

  async exile (groupId, userId, { authorId }) {
    if (await Exile.findOne({ where: { userId } })) {
      throw new ConflictError('User is already exiled.')
    }

    const rank = await this._userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) {
      throw new ForbiddenError('User is unexilable.')
    }

    try {
      await this._groupService.kick(groupId, userId)
    } catch {} // eslint-disable-line no-empty
    const exile = await Exile.create({ userId })

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(exile.userId),
      this._userService.getUsername(authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** exiled **${username}**`)

    return exile
  }

  async unexile (groupId, userId, { authorId }) {
    const exile = await this.getExile(userId)
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
