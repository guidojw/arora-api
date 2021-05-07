import { AnnounceTrainingsJob, DiscordMessageJob } from '../jobs'
import { ConflictError, NotFoundError, UnprocessableError } from '../errors'
import { ILike, Repository } from 'typeorm'
import { Training, TrainingCancellation, TrainingType } from '../entities'
import { constants, timeUtil } from '../util'
import cron, { JobCallback } from 'node-schedule'
import { inject, injectable } from 'inversify'
import { SortQuery } from '../util/request'
import { TrainingRepository } from '../repositories'
import { TrainingScopes } from '../repositories/training'
import UserService from './user'

const { TYPES } = constants
const { getDate, getTime, getTimeZoneAbbreviation } = timeUtil

@injectable()
export default class TrainingService {
  @inject(TYPES.AnnounceTrainingsJob) private readonly _announceTrainingsJob!: AnnounceTrainingsJob
  @inject(TYPES.DiscordMessageJob) private readonly _discordMessageJob!: DiscordMessageJob
  @inject(TYPES.TrainingRepository) private readonly _trainingRepository!: TrainingRepository
  @inject(TYPES.TrainingCancellationRepository) private readonly _trainingCancellationRepository!:
  Repository<TrainingCancellation>

  @inject(TYPES.TrainingTypeRepository) private readonly _trainingTypeRepository!: Repository<TrainingType>
  @inject(TYPES.UserService) private readonly _userService!: UserService

  async getTrainings (groupId: number, scopes?: string[], sort?: SortQuery): Promise<Training[]> {
    if (!TrainingScopes.has(scopes)) {
      throw new UnprocessableError('Invalid scope.')
    }

    const qb = this._trainingRepository.scopes.apply(scopes)
      .andWhere('training.groupId = :groupId', { groupId })
    if (typeof sort !== 'undefined') {
      sort.forEach(s => qb.addOrderBy(...s))
    }

    return await qb.getMany()
  }

  async getTraining (groupId: number, id: number, scopes?: string[]): Promise<Training> {
    if (!TrainingScopes.has(scopes)) {
      throw new UnprocessableError('Invalid scopes.')
    }

    const training = await this._trainingRepository.scopes.apply(scopes)
      .andWhere('training.groupId = :groupId', { groupId })
      .andWhere('id = :id', { id })
      .getOne()

    if (typeof training === 'undefined') {
      throw new NotFoundError('Training not found.')
    }
    return training
  }

  async addTraining (
    groupId: number,
    { typeId, authorId, date, notes }: { typeId: number, authorId: number, date: number, notes?: string | null }
  ): Promise<Training> {
    const trainingType = await this.getTrainingType(groupId, typeId)
    const training = await this._trainingRepository.save({
      groupId,
      authorId,
      typeId,
      date: new Date(date),
      notes
    })
    training.type = trainingType

    await this._announceTrainingsJob.run(groupId)
    cron.scheduleJob(
      `training_${training.id}`,
      new Date(training.date.getTime() + 30 * 60 * 1000),
      this._announceTrainingsJob.run.bind(this._announceTrainingsJob, groupId) as JobCallback
    )

    const dateString = getDate(training.date)
    const timeString = getTime(training.date)
    const authorName = await this._userService.getUsername(training.authorId)
    await this._discordMessageJob.run(`**${authorName}** scheduled a **${training.type.abbreviation}** training at **${dateString} ${timeString} ${getTimeZoneAbbreviation(training.date)}**${training.notes != null ? ' with note "*' + training.notes + '*"' : ''}`)

    return training
  }

  async changeTraining (
    groupId: number,
    id: number,
    { changes, editorId }: {
      changes: { authorId?: number, notes?: string | null, typeId?: number, date?: number }
      editorId: number
    }
  ): Promise<Training> {
    const training = await this.getTraining(groupId, id)

    const changeMessages = []
    if (typeof changes.authorId !== 'undefined') {
      training.authorId = changes.authorId

      const authorName = await this._userService.getUsername(training.authorId)
      changeMessages.push(`changed training **${training.id}**'s host to **${authorName}**`)
    }
    if (typeof changes.notes !== 'undefined') {
      training.notes = changes.notes

      changeMessages.push(training.notes !== null
        ? `changed training **${training.id}**'s notes to "*${training.notes}*"`
        : `removed training **${training.id}**'s notes`
      )
    }
    if (typeof changes.typeId !== 'undefined') {
      training.type = await this.getTrainingType(groupId, changes.typeId)

      changeMessages.push(`changed training **${training.id}**'s type to **${training.type.abbreviation}**`)
    }
    if (typeof changes.date !== 'undefined') {
      training.date = new Date(changes.date)

      const dateString = getDate(training.date)
      const timeString = getTime(training.date)
      changeMessages.push(`changed training **${training.id}**'s date to **${dateString} ${timeString} ${getTimeZoneAbbreviation(training.date)}**`)
    }

    if (changeMessages.length > 0) {
      await this._trainingRepository.save(training)

      const editorName = await this._userService.getUsername(editorId)
      await this._discordMessageJob.run(`**${editorName}**${changeMessages.length > 1 ? `\n- ${changeMessages.join('\n- ')}` : ` ${changeMessages[0]}`}`)

      if (typeof changes.authorId !== 'undefined' || typeof changes.typeId !== 'undefined' || typeof changes.date !==
        'undefined') {
        await this._announceTrainingsJob.run(groupId)
        const jobName = `training_${training.id}`
        const job = cron.scheduledJobs[jobName]
        if (typeof job !== 'undefined') {
          job.cancel()
        }
        cron.scheduleJob(
          jobName,
          training.date,
          this._announceTrainingsJob.run.bind(this._announceTrainingsJob, groupId) as JobCallback
        )
      }
    }

    return training
  }

  async cancelTraining (
    groupId: number,
    id: number,
    { authorId, reason }: { authorId: number, reason: string }
  ): Promise<TrainingCancellation> {
    const training = await this.getTraining(groupId, id)
    const cancellation = await this._trainingCancellationRepository.save({ trainingId: training.id, authorId, reason })

    await this._announceTrainingsJob.run(groupId)
    const job = cron.scheduledJobs[`training_${cancellation.trainingId}`]
    if (typeof job !== 'undefined') {
      job.cancel()
    }

    const authorName = await this._userService.getUsername(cancellation.authorId)
    await this._discordMessageJob.run(`**${authorName}** cancelled training **${cancellation.trainingId}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async getTrainingTypes (groupId: number): Promise<TrainingType[]> {
    return await this._trainingTypeRepository.find({ where: { groupId } })
  }

  async getTrainingType (groupId: number, id: number): Promise<TrainingType> {
    const trainingType = await this._trainingTypeRepository.findOne({ where: { groupId, id } })
    if (typeof trainingType === 'undefined') {
      throw new NotFoundError('Training type not found.')
    }
    return trainingType
  }

  async createTrainingType (
    groupId: number,
    { name, abbreviation }: { abbreviation: string, name: string }
  ): Promise<TrainingType> {
    if (typeof await this._trainingTypeRepository.findOne({
      where: { groupId, abbreviation: ILike(abbreviation.toLowerCase()) }
    }) !== 'undefined') {
      throw new ConflictError('A training type with that name already exists.')
    }

    return await this._trainingTypeRepository.save({ groupId, name, abbreviation })
  }

  async changeTrainingType (
    groupId: number,
    id: number,
    { changes, editorId }: {
      changes: { abbreviation?: string, name?: string }
      editorId: number
    }
  ): Promise<TrainingType> {
    const trainingType = await this.getTrainingType(groupId, id)

    const changeMessages = []
    const oldAbbreviation = trainingType.abbreviation
    if (typeof changes.abbreviation !== 'undefined') {
      trainingType.abbreviation = changes.abbreviation

      changeMessages.push(`changed training type **${oldAbbreviation}** abbreviation to **${trainingType.abbreviation}**`)
    }
    if (typeof changes.name !== 'undefined') {
      trainingType.name = changes.name

      changeMessages.push(`changed training type **${oldAbbreviation}**'s name to **${trainingType.name}**`)
    }

    if (changeMessages.length > 0) {
      await this._trainingTypeRepository.save(trainingType)

      const editorName = await this._userService.getUsername(editorId)
      await this._discordMessageJob.run(`**${editorName}**${changeMessages.length > 1 ? `\n- ${changeMessages.join('\n- ')}` : ` ${changeMessages[0]}`}`)
    }

    return trainingType
  }

  async deleteTrainingType (groupId: number, id: number): Promise<void> {
    const result = await this._trainingTypeRepository.delete({ groupId, id })
    if (result.affected === 0) {
      throw new NotFoundError('Training type not found.')
    }
  }
}
