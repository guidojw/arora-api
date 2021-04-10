'use strict'

const cron = require('node-schedule')
const pluralize = require('pluralize')

const { ConflictError, ForbiddenError, NotFoundError } = require('../errors')
const { inRange } = require('../util').util
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

  async suspend (groupId, userId, { authorId, duration, reason, roleBack }) {
    if (await Suspension.findOne({ where: { groupId, userId } })) {
      throw new ConflictError('User is already suspended.')
    }
    const role = await this._groupService.getRole(groupId, userId)
    if (applicationConfig.unbannableRanks.some(range => inRange(role.rank, range))) {
      throw new ForbiddenError('User\'s role is unsuspendable.')
    }

    if (role.rank > 0 && role.rank !== 2) {
      await this._groupService.setMemberRole(groupId, userId, 2)
    }
    const suspension = await Suspension.create({
      authorId,
      duration,
      groupId,
      reason,
      roleBack,
      roleId: role.id,
      userId
    })

    cron.scheduleJob(
      `suspension_${suspension.id}`,
      suspension.endsAt,
      this._finishSuspensionJob.run.bind(this._finishSuspensionJob, suspension)
    )

    const days = suspension.duration / (24 * 60 * 60 * 1000)
    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(suspension.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** suspended **${username}** for **${pluralize('day', days, true)}** with reason "*${suspension.reason}*"`)

    return suspension
  }

  async unsuspend (groupId, userId, { authorId, reason }) {
    const suspension = await this.getSuspension(groupId, userId)
    const role = await this._groupService.getRole(groupId, suspension.userId)

    if (role.rank !== 0) {
      try {
        await this._groupService.setMemberRole(groupId, suspension.userId, { id: suspension.roleId })
      } catch {
        await this._groupService.setMemberRole(groupId, suspension.userId, 1)
      }
    }

    const cancellation = await SuspensionCancellation.create({ authorId, reason, suspensionId: suspension.id })

    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) {
      job.cancel()
    }

    const [username, authorName] = await Promise.all([
      this._userService.getUsername(suspension.userId),
      this._userService.getUsername(cancellation.authorId)
    ])
    this._discordMessageJob.run(`**${authorName}** unsuspended **${username}**'s with reason "*${cancellation.reason}*"`)

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
    const days = newDuration / (24 * 60 * 60 * 1000)

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
    const extensionDays = extension.duration / (24 * 60 * 60 * 1000)
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
    if (typeof changes.roleBack !== 'undefined') {
      this._discordMessageJob.run(`**${editorName}** changed the roleBack option of **${username}**'s suspension to **${suspension.roleBack ? 'yes' : 'no'}**`)
    }

    return suspension
  }
}

module.exports = SuspensionService
