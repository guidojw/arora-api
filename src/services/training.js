'use strict'

const cron = require('node-schedule')

const { Op } = require('sequelize')
const { ConflictError, NotFoundError } = require('../errors')
const { getDate, getTime, getTimeZoneAbbreviation } = require('../helpers').timeHelper
const { Training, TrainingCancellation, TrainingType } = require('../models')

class TrainingService {
  constructor (announceTrainingsJob, discordMessageJob, userService) {
    this._announceTrainingsJob = announceTrainingsJob
    this._discordMessageJob = discordMessageJob
    this._userService = userService
  }

  getTrainings (groupId, scope, sort) {
    return Training.scope(scope ?? 'defaultScope').findAll({ where: { groupId }, order: sort })
  }

  async getTraining (groupId, trainingId, scope) {
    const training = await Training.scope(scope ?? 'defaultScope').findOne({ where: { groupId, trainingId } })
    if (!training) {
      throw new NotFoundError('Training not found.')
    }
    return training
  }

  async addTraining (groupId, { typeId, authorId, date, notes }) {
    const training = await Training.create({
      groupId,
      authorId,
      typeId,
      date,
      notes
    })
    await training.reload()

    this._announceTrainingsJob.run(groupId)
    cron.scheduleJob(
      `training_${training.id}`,
      new Date(training.date.getTime() + 30 * 60 * 1000),
      this._announceTrainingsJob.run.bind(this._announceTrainingsJob, groupId)
    )

    const dateString = getDate(training.date)
    const timeString = getTime(training.date)
    const authorName = await this._userService.getUsername(training.authorId)
    this._discordMessageJob.run(`**${authorName}** scheduled a **${training.type.abbreviation}** training at **${dateString} ${timeString} ${getTimeZoneAbbreviation(training.date)}**${training.notes ? ' with note "*' + training.notes + '*"' : ''}`)

    return training
  }

  async changeTraining (groupId, trainingId, { changes, editorId }) {
    let training = await this.getTraining(groupId, trainingId)
    training = await training.update(changes)

    if (typeof changes.authorId !== 'undefined' || typeof changes.typeId !== 'undefined' || typeof changes.date !==
      'undefined') {
      this._announceTrainingsJob.run(groupId)
      const jobName = `training_${training.id}`
      const job = cron.scheduledJobs[jobName]
      if (job) {
        job.cancel()
      }
      cron.scheduleJob(
        jobName,
        training.date,
        this._announceTrainingsJob.run.bind(this._announceTrainingsJob, groupId)
      )
    }

    const editorName = await this._userService.getUsername(editorId)
    if (typeof changes.authorId !== 'undefined') {
      const authorName = await this._userService.getUsername(training.authorId)
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s host to **${authorName}**`)
    }
    if (typeof changes.notes !== 'undefined') {
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s notes to "*${training.notes}*"`)
    }
    if (typeof changes.typeId !== 'undefined') {
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s type to **${training.type.abbreviation}**`)
    }
    if (typeof changes.date !== 'undefined') {
      const dateString = getDate(training.date)
      const timeString = getTime(training.date)
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s date to **${dateString} ${timeString} ${getTimeZoneAbbreviation(training.date)}**`)
    }

    return training
  }

  async cancelTraining (groupId, trainingId, { authorId, reason }) {
    const training = await this.getTraining(groupId, trainingId)
    const cancellation = await TrainingCancellation.create({ trainingId: training.id, authorId, reason })

    this._announceTrainingsJob.run(groupId)
    const job = cron.scheduledJobs[`training_${cancellation.trainingId}`]
    if (job) {
      job.cancel()
    }

    const authorName = await this._userService.getUsername(cancellation.authorId)
    this._discordMessageJob.run(`**${authorName}** cancelled training **${cancellation.trainingId}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async createTrainingType (groupId, { name, abbreviation }) {
    if (await TrainingType.findOne({ where: { groupId, abbreviation: { [Op.iLike]: abbreviation.toLowerCase() } } })) {
      throw new ConflictError('Training type already exists.')
    }

    return TrainingType.create({ groupId, name, abbreviation })
  }

  getTrainingTypes () {
    return TrainingType.findAll()
  }

  async changeTrainingType (groupId, typeId, { changes }) {
    const trainingType = await TrainingType.findOne({ where: { groupId, typeId } })
    if (!trainingType) {
      throw new NotFoundError('Training type not found.')
    }

    return trainingType.update(changes)
  }

  async deleteTrainingType (groupId, typeId) {
    const trainingType = await TrainingType.findOne({ where: { groupId, typeId } })
    if (!trainingType) {
      throw new NotFoundError('Training type not found.')
    }

    return trainingType.destroy()
  }
}

module.exports = TrainingService
