import { GroupService, UserService } from '../services'
import { constants, timeUtil } from '../util'
import { inject, injectable } from 'inversify'
import BaseJob from './base'
import { GetUsers } from '../services/user'
import { Training } from '../entities'
import { TrainingRepository } from '../repositories'
import cron from 'node-schedule'

const { TYPES } = constants
const { getTime, getTimeZoneAbbreviation } = timeUtil

@injectable()
export default class AnnounceTrainingsJob implements BaseJob {
  @inject(TYPES.TrainingRepository) private readonly _trainingRepository!: TrainingRepository
  @inject(TYPES.GroupService) private readonly _groupService!: GroupService
  @inject(TYPES.UserService) private readonly _userService!: UserService

  async run (groupId?: number): Promise<any> {
    if (typeof groupId === 'undefined') {
      const groupIds = (await this._trainingRepository.scopes.default
        .select('training.groupId')
        .groupBy('training.groupId, training.id')
        .getMany()
      ).map(training => training.groupId)
      return Promise.all(groupIds.map(async groupId => await this.run(groupId)))
    }

    const trainings = await this._trainingRepository.find({ where: { groupId } })
    for (const training of trainings) {
      const jobName = `training_${training.id}`
      const job = cron.scheduledJobs[jobName]
      if (typeof job === 'undefined') {
        cron.scheduleJob(
          jobName,
          new Date(training.date.getTime() + 30 * 60 * 1000),
          this.run.bind(this, groupId) // eslint-disable-line @typescript-eslint/no-misused-promises
        )
      }
    }

    const now = new Date()
    const today = now.getDate()
    const isDay = (day: number) => (training: Training) => training.date.getDate() === day
    const trainingsToday = trainings.filter(isDay(today))
    const trainingsTomorrow = trainings.filter(isDay(today + 1))
    const authorIds = [...new Set([
      ...trainingsToday.map(training => training.authorId),
      ...trainingsTomorrow.map(training => training.authorId)
    ])]
    const authors = authorIds.length > 0
      ? await this._userService.getUsers(authorIds)
      : []

    let shout = 'Trainings today - '
    shout += getTrainingsInfo(trainingsToday, authors)
    shout += '. Trainings tomorrow - '
    shout += getTrainingsInfo(trainingsTomorrow, authors)
    shout += '.'

    const addition = ` (Timezone: ${getTimeZoneAbbreviation(now)})`

    // Cut excessive characters of shout.
    if (shout.length > 255 - addition.length) {
      shout = `${shout.substring(0, 255 - addition.length - 3)}...`
    }

    shout += addition

    // Compare current shout with new shout and update if they differ.
    const oldShout = await this._groupService.getGroupStatus(groupId)
    if (shout !== oldShout.body) {
      await this._groupService.updateGroupStatus(groupId, shout)
    }
  }
}

function getTrainingsInfo (trainings: Training[], authors: GetUsers): string {
  const groupedTrainings = groupTrainingsByType(trainings)
  const types = Object.keys(groupedTrainings)
  let result = ''

  if (types.length > 0) {
    for (let i = 0; i < types.length; i++) {
      const type = types[i]
      const typeTrainings = groupedTrainings[type]

      result += `${type}:`

      for (let j = 0; j < typeTrainings.length; j++) {
        const training = typeTrainings[j]
        const timeString = getTime(training.date)
        const author = authors.find(author => author.id === training.authorId)

        result += ` ${timeString} (host: ${author?.name ?? 'unknown'})`
        if (j < typeTrainings.length - 2) {
          result += ','
        } else if (j === typeTrainings.length - 2) {
          result += ' and'
        }
      }

      if (i <= types.length - 2) {
        result += ' | '
      }
    }
  } else {
    result += 'none'
  }
  return result
}

function groupTrainingsByType (trainings: Training[]): Record<string, Training[]> {
  const result: Record<string, Training[]> = {}
  for (const training of trainings) {
    if (typeof result[training.type.abbreviation] === 'undefined') {
      result[training.type.abbreviation] = []
    }
    result[training.type.abbreviation].push(training)
  }
  return result
}