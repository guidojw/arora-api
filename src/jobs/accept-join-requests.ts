import type { RobloxManager, WebSocketManager } from '../managers'
import { inject, injectable } from 'inversify'
import type BaseJob from './base'
import type { CursorPage } from '@guidojw/bloxy/dist/structures/Asset'
import type DiscordMessageJob from './discord-message'
import type { Exile } from '../entities'
import type { GetJoinRequest } from '@guidojw/bloxy/dist/client/apis/GroupsAPI'
import type { GroupService } from '../services'
import type HealthCheckJob from './health-check'
import type { Repository } from 'typeorm'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class AcceptJoinRequestsJob implements BaseJob {
  @inject(TYPES.DiscordMessageJob) private readonly discordMessageJob!: DiscordMessageJob
  @inject(TYPES.ExileRepository) private readonly exileRepository!: Repository<Exile>
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.HealthCheckJob) private readonly healthCheckJob!: HealthCheckJob
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager
  @inject(TYPES.WebSocketManager) private readonly webSocketManager!: WebSocketManager

  public async run (groupId: number): Promise<any> {
    const client = this.robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)

    let cursor = null
    do {
      const requests: CursorPage<GetJoinRequest> = await group.getJoinRequests({ cursor: cursor ?? undefined })
      for (const request of requests.data) {
        const userId = request.requester.userId

        try {
          if (typeof await this.exileRepository.findOne({ where: { groupId, userId } }) !== 'undefined') {
            await group.declineJoinRequest(userId)
            await this.discordMessageJob.run(`Declined **${request.requester.username}**'s join request`)
          } else {
            await group.acceptJoinRequest(userId)
            const rank = await this.groupService.getRank(groupId, userId)
            this.webSocketManager.broadcast('rankChange', { groupId, userId, rank })
            await this.discordMessageJob.run(`Accepted **${request.requester.username}**'s join request`)
          }
        } catch {} // Ignore error, this job is run frequently anyways.
      }

      cursor = requests.cursors.next
    } while (cursor !== null)

    await this.healthCheckJob.run('acceptJoinRequestsJob')
  }
}
