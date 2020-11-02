'use strict'
const cron = require('node-schedule')
const pluralize = require('pluralize')

const { Suspension, SuspensionCancellation, SuspensionExtension } = require('../models')
const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')

const robloxConfig = require('../../config/roblox')

class SuspensionService {
  constructor (groupService, userService, robloxManager, finishSuspensionJob, discordMessageJob) {
    this._groupService = groupService
    this._userService = userService
    this._robloxManager = robloxManager
    this._finishSuspensionJob = finishSuspensionJob
    this._discordMessageJob = discordMessageJob
  }

  getSuspensions (scope, sort) {
    return Suspension.scope(scope || 'defaultScope').findAll({ order: sort })
  }

  async getSuspension (userId, scope) {
    const suspension = await Suspension.scope(scope || 'defaultScope').findOne({ where: { userId } })
    if (!suspension) {
      throw new NotFoundError('Suspension not found.')
    }
    return suspension
  }

  async suspend (groupId, userId, { rankBack, duration, authorId, reason }) {
    if (await Suspension.findOne({ where: { userId } })) {
      throw new ConflictError('User is already suspended.')
    }

    const rank = await this._userService.getRank(userId, groupId)
    if (rank === 2) {
      throw new ConflictError('User is already suspended.')
    }
    if (rank >= 200 || rank === 99 || rank === 103) {
      throw new ForbiddenError('User is unsuspendable.')
    }
    if (rank > 0 && rank !== 2) {
      await this._groupService.setRank(groupId, userId, 2)
    }

    const mtRank = await this._userService.getRank(userId, robloxConfig.mtGroup)
    if (mtRank > 0) {
      const client = this._robloxManager.getClient(robloxConfig.mtGroup)
      const group = await client.getGroup(robloxConfig.mtGroup)
      await group.kickMember(userId)
    }

    const suspension = await Suspension.create({
      rankBack,
      duration,
      authorId,
      reason,
      userId,
      rank
    })

    cron.scheduleJob(
            `suspension_${suspension.id}`,
            await suspension.endDate,
            this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
    )

    const days = suspension.duration / 86400000
    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(suspension.authorId)
    ])
    this._discordMessageJob.run('log', `**${authorName}** suspended **${username}** for **${days}** ${pluralize('day', days)} with reason "*${suspension.reason}*"`)

    return suspension
  }

  async cancelSuspension (groupId, userId, { authorId, reason }) {
    const suspension = await this.getSuspension(userId)
    const rank = await this._userService.getRank(suspension.userId, groupId)

    if (rank !== 0) {
      await this._groupService.setRank(groupId, suspension.userId, suspension.rank)
    }

    const cancellation = await SuspensionCancellation.create({ suspensionId: suspension.id, authorId, reason })

    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) {
      job.cancel()
    }

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(cancellation.authorId)
    ])
    this._discordMessageJob.run('log', `**${authorName}** cancelled **${username}**'s suspension with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async extendSuspension (groupId, userId, { authorId, duration, reason }) {
    const suspension = await this.getSuspension(userId)
    let newDuration = suspension.duration + duration
    if (suspension.extensions) {
      for (const extension of suspension.extensions) {
        newDuration += extension.duration
      }
    }
    const days = newDuration / 86400000

    if (days < 1) {
      throw new ForbiddenError('Insufficient amount of days.')
    }
    if (days > 7) {
      throw new ForbiddenError('Too many days.')
    }

    const extension = await SuspensionExtension.create({
      suspensionId: suspension.id,
      authorId,
      duration,
      reason
    })

    const jobName = `suspension_${suspension.id}`
    const job = cron.scheduledJobs[jobName]
    if (job) {
      job.cancel()
    }
    cron.scheduleJob(
      jobName,
      await suspension.endDate,
      this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
    )

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(extension.authorId)
    ])
    const extensionDays = extension.duration / 86400000
    this._discordMessageJob.run('log', `**${authorName}** extended **${username}**'s suspension with **${extensionDays}** ${pluralize('day', extensionDays)}`)

    return extension
  }

  async changeSuspension (groupId, userId, { changes, editorId }) {
    let suspension = await this.getSuspension(userId)
    suspension = await suspension.update(changes)

    const [username, editorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(editorId)
    ])
    if (changes.authorId) {
      const authorName = await this._userService.getUsername(suspension.authorId)
      this._discordMessageJob.run('log', `**${editorName}** changed the author of **${username}**'s suspension to **${authorName}**`)
    }
    if (changes.reason) {
      this._discordMessageJob.run('log', `**${editorName}** changed the reason of **${username}**'s suspension to *"${suspension.reason}"*`)
    }
    if (changes.rankBack !== undefined) {
      this._discordMessageJob.run('log', `**${editorName}** changed the rankBack option of **${username}**'s suspension to **${suspension.rankBack ? 'yes' : 'no'}**`)
    }

    return suspension
  }
}

module.exports = SuspensionService
