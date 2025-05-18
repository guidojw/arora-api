import { inject, injectable } from 'inversify'
import type BaseJob from './base'
import DiscordMessageJob from './discord-message'
import type { Exile } from '../entities'
import { GroupService } from '../services'
import HealthCheckJob from './health-check'
import { Repository } from 'typeorm'
import { WebSocketManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class AcceptJoinRequestsJob implements BaseJob {
  @inject(TYPES.DiscordMessageJob) private readonly discordMessageJob!: DiscordMessageJob
  @inject(TYPES.ExileRepository) private readonly exileRepository!: Repository<Exile>
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.HealthCheckJob) private readonly healthCheckJob!: HealthCheckJob
  @inject(TYPES.WebSocketManager) private readonly webSocketManager!: WebSocketManager

  public async run (groupId: number): Promise<any> {
    const joinRequests = await this.groupService.getJoinRequests(groupId)
    for (const joinRequest of joinRequests) {
      const userId = Number(parseInt(joinRequest.user.split('/')[1]))

      try {
        if (typeof await this.exileRepository.findOne({ where: { groupId, userId } }) !== 'undefined') {
          await this.groupService.declineJoinRequest(joinRequest.path)
          await this.discordMessageJob.run(`Declined **${joinRequest.user}**'s join request`)
        } else {
          await this.groupService.acceptJoinRequest(joinRequest.path)
          const rank = await this.groupService.getRank(groupId, userId)
          this.webSocketManager.broadcast('rankChange', { groupId, userId, rank })
          await this.discordMessageJob.run(`Accepted **${joinRequest.user}**'s join request`)
        }
      } catch {} // Ignore error, this job is run frequently anyways.
    }

    await this.healthCheckJob.run('acceptJoinRequestsJob')
  }
}
