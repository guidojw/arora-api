import { inject, injectable } from 'inversify'
import { NotFoundError } from '../errors'
import { RobloxManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export enum StatusState {
  Running = 'RUNNING'
}
export interface GetStatus { state: StatusState }

@injectable()
export default class StatusService {
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager

  public getStatus (): GetStatus {
    return {
      state: StatusState.Running
    }
  }

  public async getGroupClientStatus (groupId: number): Promise<boolean> {
    const client = this.robloxManager.getClient(groupId)
    if (typeof client === 'undefined') {
      throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return typeof authenticationData !== 'undefined'
  }
}
