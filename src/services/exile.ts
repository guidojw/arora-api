import { ConflictError, ForbiddenError, NotFoundError } from '../errors'
import { constants, util } from '../util'
import { inject, injectable } from 'inversify'
import { DiscordMessageJob } from '../jobs'
import { Exile } from '../entities'
import GroupService from './group'
import { Repository } from 'typeorm'
import UserService from './user'
import applicationConfig from '../configs/application'

const { TYPES } = constants
const { inRange } = util

@injectable()
export default class ExileService {
  @inject(TYPES.DiscordMessageJob) private readonly discordMessageJob!: DiscordMessageJob
  @inject(TYPES.ExileRepository) private readonly exileRepository!: Repository<Exile>
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.UserService) private readonly userService!: UserService

  public async getExiles (groupId: number): Promise<Exile[]> {
    return await this.exileRepository.find({ where: { groupId } })
  }

  public async getExile (groupId: number, userId: number): Promise<Exile> {
    const exile = await this.exileRepository.findOne({ where: { groupId, userId } })
    if (typeof exile === 'undefined') {
      throw new NotFoundError('Exile not found.')
    }
    return exile
  }

  public async exile (
    groupId: number,
    userId: number,
    { authorId, reason }: { authorId: number, reason: string}
  ): Promise<Exile> {
    if (typeof await this.exileRepository.findOne({ where: { groupId, userId } }) !== 'undefined') {
      throw new ConflictError('User is already exiled.')
    }
    const rank = await this.groupService.getRank(groupId, userId)
    if (applicationConfig.unexilableRanks.some(range => inRange(rank, range))) {
      throw new ForbiddenError('User\'s role is unexilable.')
    }

    try {
      await this.groupService.kickMember(groupId, userId)
    } catch {} // eslint-disable-line no-empty
    const exile = await this.exileRepository.save({ authorId, groupId, reason, userId })

    const [username, authorName] = await Promise.all([
      this.userService.getUsername(exile.userId),
      this.userService.getUsername(authorId)
    ])
    await this.discordMessageJob.run(`**${authorName}** exiled **${username}** with reason **${exile.reason}**`)

    return exile
  }

  public async unexile (
    groupId: number,
    userId: number,
    { authorId, reason }: { authorId: number, reason: string }
  ): Promise<void> {
    const exile = await this.getExile(groupId, userId)
    await this.exileRepository.delete(exile.id)

    const [username, authorName] = await Promise.all([
      this.userService.getUsername(exile.userId),
      this.userService.getUsername(authorId)
    ])
    await this.discordMessageJob.run(`**${authorName}** unexiled **${username}** with reason **${reason}**`)
  }
}
