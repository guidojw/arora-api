import { NotFoundError } from '../errors'

export enum StatusState {
  Running = 'RUNNING'
}
export interface Status { state: StatusState }

export default class StatusService {
  _robloxManager: any

  constructor (robloxManager: any) {
    this._robloxManager = robloxManager
  }

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
