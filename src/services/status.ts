import { inject, injectable } from 'inversify'
import { NotFoundError } from '../errors'
import { RobloxManager } from '../managers'
import TYPES from '../util/types'

export enum StatusState {
  Running = 'RUNNING'
}
export interface Status { state: StatusState }

@injectable()
export default class StatusService {
  @inject(TYPES.RobloxManager) private readonly _robloxManager!: RobloxManager

  getStatus (): Status {
    return {
      state: StatusState.Running
    }
  }

  async getGroupClientStatus (groupId: number): Promise<boolean> {
    const client = this._robloxManager.getClient(groupId)
    if (typeof client === 'undefined') {
      throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return typeof authenticationData !== 'undefined'
  }
}
