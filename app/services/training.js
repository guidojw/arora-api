'use strict'
const cron = require('node-schedule')

const { Training, TrainingCancellation, TrainingType } = require('../models')
const { ConflictError, NotFoundError } = require('../errors')
const { timeHelper } = require('../helpers')

const robloxConfig = require('../../config/roblox')

class TrainingService {
  constructor (announceTrainingsJob, discordMessageJob, userService) {
    this._announceTrainingsJob = announceTrainingsJob
    this._discordMessageJob = discordMessageJob
    this._userService = userService
  }

  async addTraining ({ type, authorId, date, notes }) {
    const training = await Training.create({
      type: type.toLowerCase(),
      authorId,
      date,
      notes
    })

    this._announceTrainingsJob.run(robloxConfig.defaultGroup)
    cron.scheduleJob(
            `training_${training.id}`,
            new Date(training.date.getTime() + 30 * 60 * 1000),
            this._announceTrainingsJob.run.bind(this._announceTrainingsJob, robloxConfig.defaultGroup)
    )

    const dateString = timeHelper.getDate(training.date)
    const timeString = timeHelper.getTime(training.date)
    const authorName = await this._userService.getUsername(training.authorId)
    this._discordMessageJob.run(`**${authorName}** scheduled a **${training.type.toUpperCase()}** training at **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**${training.notes ? ' with note "*' + training.notes + '*"' : ''}`)

    return training
  }

  getTrainings (scope, sort) {
    return Training.scope(scope || 'defaultScope').findAll({ order: sort })
  }

  async getTraining (trainingId, scope) {
    const training = await Training.scope(scope || 'defaultScope').findByPk(trainingId)
    if (!training) {
      throw new NotFoundError('Training not found.')
    }
    return training
  }

  async changeTraining (groupId, trainingId, { changes, editorId }) {
    let training = await this.getTraining(trainingId)
    training = await training.update(changes)

    if (!changes.notes) {
      this._announceTrainingsJob.run(robloxConfig.defaultGroup)
      const jobName = `training_${training.id}`
      const job = cron.scheduledJobs[jobName]
      if (job) {
        job.cancel()
      }
      cron.scheduleJob(
        jobName,
        training.date,
        this._announceTrainingsJob.run.bind(this._announceTrainingsJob, robloxConfig.defaultGroup)
      )
    }

    const editorName = await this._userService.getUsername(editorId)
    if (changes.authorId) {
      const authorName = await this._userService.getUsername(training.authorId)
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s host to **${authorName}**`)
    }
    if (changes.notes) {
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s notes to "*${training.notes}*"`)
    }
    if (changes.type) {
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s type to **${training.type.toUpperCase()}**`)
    }
    if (changes.date) {
      const dateString = timeHelper.getDate(training.date)
      const timeString = timeHelper.getTime(training.date)
      this._discordMessageJob.run(`**${editorName}** changed training **${training.id}**'s date to **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**`)
    }

    return training
  }

  async cancelTraining (groupId, trainingId, { authorId, reason }) {
    const training = await this.getTraining(trainingId)
    const cancellation = await TrainingCancellation.create({ trainingId: training.id, authorId, reason })

    this._announceTrainingsJob.run(robloxConfig.defaultGroup)
    const job = cron.scheduledJobs[`training_${cancellation.trainingId}`]
    if (job) {
      job.cancel()
    }

    const authorName = await this._userService.getUsername(cancellation.authorId)
    this._discordMessageJob.run(`**${authorName}** cancelled training **${cancellation.trainingId}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async createTrainingType (_groupId, { name }) {
    if (await TrainingType.findOne({ where: { name } })) {
      throw new ConflictError('Training type already exists.')
    }

    return TrainingType.create({ name })
  }

  getTrainingTypes () {
    return TrainingType.findAll()
  }

  async deleteTrainingType (_groupId, typeName) {
    const trainingType = await TrainingType.findOne({ where: { name: typeName } })
    if (!trainingType) {
      throw new NotFoundError('Training type not found.')
    }

    return trainingType.destroy()
  }
}

module.exports = TrainingService
