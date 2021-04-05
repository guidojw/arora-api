'use strict'

const cron = require('node-schedule')
const pluralize = require('pluralize')

const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')
const { inRange } = require('../helpers').dataHelper
const { Suspension, SuspensionCancellation, SuspensionExtension } = require('../models')

const applicationConfig = require('../../config/application')

class SuspensionService {
  constructor (discordMessageJob, finishSuspensionJob, groupService, userService) {
    this._discordMessageJob = discordMessageJob
    this._finishSuspensionJob = finishSuspensionJob
    this._groupService = groupService
    this._userService = userService
  }

  getSuspensions (groupId, scope, sort) {
    return Suspension.scope(scope ?? 'defaultScope').findAll({ where: { groupId }, order: sort })
  }

  async getSuspension (groupId, userId, scope) {
    const suspension = await Suspension.scope(scope ?? 'defaultScope').findOne({ where: { groupId, userId } })
    if (!suspension) {
      throw new NotFoundError('Suspension not found.')
    }
    return suspension
  }

  async suspend (groupId, userId, { rankBack, duration, authorId, reason }) {
    if (await Suspension.findOne({ where: { groupId, userId } })) {
      throw new ConflictError('User is already suspended.')
    }
    const rank = await this._userService.getRank(userId, groupId)
    if (applicationConfig.unbannableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('User\'s rank is unsuspendable.')
    }

    if (rank > 0 && rank !== 2) {
      await this._groupService.setMemberRank(groupId, userId, 2)
    }
    const suspension = await Suspension.create({
      groupId,
      authorId,
      userId,
      rank,
      duration,
      rankBack,
      reason
    })

    cron.scheduleJob(
      `suspension_${suspension.id}`,
      suspension.endsAt,
      this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
    )

    const days = suspension.duration / 24 * 60 * 60 * 1000
    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(suspension.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** suspended **${username}** for **${pluralize('day', days, true)}** with reason "*${suspension.reason}*"`)

    return suspension
  }

  async cancelSuspension (groupId, userId, { authorId, reason }) {
    const suspension = await this.getSuspension(groupId, userId)
    const rank = await this._userService.getRank(suspension.userId, groupId)

    if (rank !== 0) {
      await this._groupService.setMemberRank(groupId, suspension.userId, suspension.rank)
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
    this._discordMessageJob.run(`**${authorName}** cancelled **${username}**'s suspension with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async extendSuspension (groupId, userId, { authorId, duration, reason }) {
    const suspension = await this.getSuspension(groupId, userId)
    let newDuration = suspension.duration + duration
    if (suspension.extensions) {
      for (const extension of suspension.extensions) {
        newDuration += extension.duration
      }
    }
    const days = newDuration / 24 * 60 * 60 * 1000

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
      suspension.endsAt,
      this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
    )

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(extension.authorId)
    ])
    const extensionDays = extension.duration / 24 * 60 * 60 * 1000
    this._discordMessageJob.run(`**${authorName}** extended **${username}**'s suspension with **${pluralize('day', extensionDays, true)}**`)

    return extension
  }

  async changeSuspension (groupId, userId, { changes, editorId }) {
    let suspension = await this.getSuspension(groupId, userId)
    suspension = await suspension.update(changes)

    const [username, editorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(editorId)
    ])
    if (typeof changes.authorId !== 'undefined') {
      const authorName = await this._userService.getUsername(suspension.authorId)
      this._discordMessageJob.run(`**${editorName}** changed the author of **${username}**'s suspension to **${authorName}**`)
    }
    if (typeof changes.reason !== 'undefined') {
      this._discordMessageJob.run(`**${editorName}** changed the reason of **${username}**'s suspension to *"${suspension.reason}"*`)
    }
    if (typeof changes.rankBack !== 'undefined') {
      this._discordMessageJob.run(`**${editorName}** changed the rankBack option of **${username}**'s suspension to **${suspension.rankBack ? 'yes' : 'no'}**`)
    }

    return suspension
  }
}

module.exports = SuspensionService
