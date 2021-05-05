import { inject, injectable } from 'inversify'
import BaseJob from './base'
import { CursorPage } from 'bloxy/dist/structures/Asset'
import DiscordMessageJob from './discord-message'
import { Exile } from '../entities'
import { GroupJoinRequest } from 'bloxy/dist/structures/Group'
import HealthCheckJob from './health-check'
import { Repository } from 'typeorm'
import { RobloxManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export type JoinRequest = Omit<GroupJoinRequest, 'user'> & { user: Omit<GroupJoinRequest['user'], 'name'> & {
  name: string }}

@injectable()
export default class AcceptJoinRequestsJob implements BaseJob {
  @inject(TYPES.DiscordMessageJob) private readonly _discordMessageJob!: DiscordMessageJob
  @inject(TYPES.HealthCheckJob) private readonly _healthCheckJob!: HealthCheckJob
  @inject(TYPES.RobloxManager) private readonly _robloxManager!: RobloxManager
  @inject(TYPES.ExileRepository) private readonly _exileRepository!: Repository<Exile>

  async run (groupId: number): Promise<any> {
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)

    let cursor = null
    do {
      const requests: CursorPage<GroupJoinRequest> = await group.getJoinRequests({ cursor: cursor ?? undefined })
      for (const request of requests.data as JoinRequest[]) {
        const userId = request.user.id

        if (typeof await this._exileRepository.findOne({ where: { groupId, userId } }) !== 'undefined') {
          await group.declineJoinRequest(userId)
          await this._discordMessageJob.run(`Declined **${request.user.name}**'s join request`)
        } else {
          await group.acceptJoinRequest(userId)
          await this._discordMessageJob.run(`Accepted **${request.user.name}**'s join request`)
        }
      }

      cursor = requests.cursors.next
    } while (cursor !== null)

    await this._healthCheckJob.run('acceptJoinRequestsJob')
  }
}
