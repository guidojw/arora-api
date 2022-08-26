import { GroupService, UserService } from '../services'
import { constants, timeUtil } from '../util'
import cron, { type JobCallback } from 'node-schedule'
import { inject, injectable } from 'inversify'
import type BaseJob from './base'
import type { GetUsers } from '../services/user'
import type { Training } from '../entities'
import { TrainingRepository } from '../repositories'

const { TYPES } = constants
const { getTime, getTimeZoneAbbreviation } = timeUtil

@injectable()
export default class AnnounceTrainingsJob implements BaseJob {
  @inject(TYPES.TrainingRepository) private readonly trainingRepository!: typeof TrainingRepository
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.UserService) private readonly userService!: UserService

  public async run (groupId?: number): Promise<any> {
    if (typeof groupId === 'undefined') {
      const groupIds = (await this.trainingRepository.scopes().default
        .select('DISTINCT training.group_id')
        .addGroupBy('training.group_id')
        .getMany()
      ).map(training => training.groupId)
      return await Promise.all(groupIds.map(async groupId => await this.run(groupId)))
    }

    const trainings = await this.trainingRepository.scopes().default
      .andWhere('training.group_id = :groupId', { groupId })
      .getMany()
    for (const training of trainings) {
      const jobName = `training_${training.id}`
      const job = cron.scheduledJobs[jobName]
      if (typeof job === 'undefined') {
        cron.scheduleJob(
          jobName,
          new Date(training.date.getTime() + 30 * 60 * 1000),
          this.run.bind(this, groupId) as JobCallback
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
      ? await this.userService.getUsers(authorIds)
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
    const oldShout = await this.groupService.getGroupStatus(groupId)
    if (shout !== oldShout?.body) {
      await this.groupService.updateGroupStatus(groupId, shout)
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

        result += ` ${timeString} (host: ${author?.name as string ?? 'unknown'})`
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
    if (training.type == null) {
      continue
    }
    if (typeof result[training.type.abbreviation] === 'undefined') {
      result[training.type.abbreviation] = []
    }
    result[training.type.abbreviation].push(training)
  }
  return result
}
