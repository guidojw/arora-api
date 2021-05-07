import { Ban, BanCancellation, BanExtension } from '../entities'
import { BanRepository, BanScopes } from '../repositories'
import { ConflictError, ForbiddenError, NotFoundError, UnprocessableError } from '../errors'
import { constants, util } from '../util'
import { inject, injectable } from 'inversify'
import { DiscordMessageJob } from '../jobs'
import GroupService from './group'
import { Repository } from 'typeorm'
import { SortQuery } from '../util/request'
import UserService from './user'
import applicationConfig from '../configs/application'
import pluralize from 'pluralize'

const { TYPES } = constants
const { inRange } = util

@injectable()
export default class BanService {
  @inject(TYPES.DiscordMessageJob) private readonly _discordMessageJob!: DiscordMessageJob
  @inject(TYPES.BanRepository) private readonly _banRepository!: BanRepository
  @inject(TYPES.BanRepository) private readonly _banCancellationRepository!: Repository<BanCancellation>
  @inject(TYPES.BanExtensionRepository) private readonly _banExtensionRepository!: Repository<BanExtension>
  @inject(TYPES.GroupService) private readonly _groupService!: GroupService
  @inject(TYPES.UserService) private readonly _userService!: UserService

  async getBans (groupId: number, scopes?: string[], sort?: SortQuery): Promise<Ban[]> {
    if (!BanScopes.has(scopes)) {
      throw new UnprocessableError('Invalid scope.')
    }

    const qb = this._banRepository.scopes.apply(scopes)
      .andWhere('ban.groupId = :groupId', { groupId })
    if (typeof sort !== 'undefined') {
      sort.forEach(s => qb.addOrderBy(...s))
    }

    return await qb.getMany()
  }

  async getBan (groupId: number, userId: number, scopes?: string[]): Promise<Ban> {
    if (!BanScopes.has(scopes)) {
      throw new UnprocessableError('Invalid scope.')
    }

    const ban = await this._banRepository.scopes.apply(scopes)
      .andWhere('ban.groupId = :groupId', { groupId })
      .andWhere('userId = :userId', { userId })
      .getOne()

    if (typeof ban === 'undefined') {
      throw new NotFoundError('Ban not found.')
    }
    return ban
  }

  async ban (
    groupId: number,
    userId: number,
    { authorId, duration, reason }: { authorId: number, duration?: number | null, reason: string }
  ): Promise<Ban> {
    if (typeof await this._banRepository.findOne({ where: { groupId, userId } }) !== 'undefined') {
      throw new ConflictError('User is already banned.')
    }
    const role = await this._groupService.getRole(groupId, userId)
    if (applicationConfig.unbannableRanks.some(range => inRange(role.rank, range))) {
      throw new ForbiddenError('User\'s role is unbannable.')
    }

    let days
    if (duration != null) {
      days = duration / (24 * 60 * 60 * 1000)
      if (days < 1) {
        throw new UnprocessableError('Insufficient amount of days.')
      }
      if (days > 7) {
        throw new UnprocessableError('Too many days.')
      }
    }

    const ban = await this._banRepository.save({
      authorId,
      duration: duration,
      groupId,
      reason,
      roleId: role.id,
      userId
    })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(ban.authorId),
      this._userService.getUsername(ban.userId)
    ])
    await this._discordMessageJob.run(`**${authorName}** banned **${username}**${typeof days !== 'undefined' ? ` for **${pluralize('day', days, true) as string}**` : ''} with reason "*${ban.reason}*"`)

    return ban
  }

  async unban (
    groupId: number,
    userId: number,
    { authorId, reason }: { authorId: number, reason: string }
  ): Promise<BanCancellation> {
    const ban = await this.getBan(groupId, userId)
    const cancellation = await this._banCancellationRepository.save({ banId: ban.id, authorId, reason })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(cancellation.authorId),
      this._userService.getUsername(ban.userId)
    ])
    await this._discordMessageJob.run(`**${authorName}** unbanned **${username}** with reason "*${cancellation.reason}*"`)

    return cancellation
  }

  async extendBan (
    groupId: number,
    userId: number,
    { authorId, duration, reason }: { authorId: number, duration: number, reason: string }
  ): Promise<BanExtension> {
    const ban = await this.getBan(groupId, userId)
    if (ban.duration == null) {
      throw new UnprocessableError('Ban is permanent.')
    }

    let newDuration = ban.duration
    newDuration += ban.extensions.reduce((result, extension) => result + extension.duration, 0)
    newDuration += duration
    const days = newDuration / (24 * 60 * 60 * 1000)
    if (days < 1) {
      throw new UnprocessableError('Insufficient amount of days.')
    }
    if (days > 7) {
      throw new UnprocessableError('Too many days.')
    }

    const extension = await this._banExtensionRepository.save({
      authorId,
      banId: ban.id,
      duration,
      reason
    })

    const [authorName, username] = await Promise.all([
      this._userService.getUsername(extension.authorId),
      this._userService.getUsername(ban.userId)
    ])
    const extensionDays = extension.duration / (24 * 60 * 60 * 1000)
    await this._discordMessageJob.run(`**${authorName}** extended **${username}**'s ban with **${pluralize('day', extensionDays, true) as string}**`)

    return extension
  }

  async changeBan (
    groupId: number,
    userId: number,
    { changes, editorId }: {
      changes: { authorId?: number, reason?: string }
      editorId: number
    }
  ): Promise<Ban> {
    const ban = await this.getBan(groupId, userId)

    const changeMessages = []
    const username = await this._userService.getUsername(ban.userId)
    if (typeof changes.authorId !== 'undefined') {
      ban.authorId = changes.authorId

      const authorName = await this._userService.getUsername(ban.authorId)
      changeMessages.push(`changed the author of **${username}**'s ban to **${authorName}**`)
    }
    if (typeof changes.reason !== 'undefined') {
      ban.reason = changes.reason

      changeMessages.push(`changed the reason of **${username}**'s ban to "*${ban.reason}*"`)
    }

    if (changeMessages.length > 0) {
      await this._banRepository.save(ban)

      const editorName = await this._userService.getUsername(editorId)
      await this._discordMessageJob.run(`**${editorName}**${changeMessages.length > 1 ? `\n- ${changeMessages.join('\n- ')}` : ` ${changeMessages[0]}`}`)
    }

    return ban
  }
}
