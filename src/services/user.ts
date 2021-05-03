import { GetUserById, GetUsersByUserIds } from 'bloxy/dist/client/apis/UsersAPI'
import { inject, injectable } from 'inversify'
import { NotFoundError } from '../errors'
import { RobloxManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export type GetUsers = GetUsersByUserIds['data']

@injectable()
export default class UserService {
  @inject(TYPES.RobloxManager) private readonly _robloxManager!: RobloxManager

  async getUserIdFromUsername (username: string): Promise<number> {
    const client = this._robloxManager.getClient()
    const user = await client.getUserIdFromUsername(username)

    // This Roblox endpoint doesn't throw HTTP 404 if a user doesn't exist..
    if (typeof user.id === 'undefined') {
      throw new NotFoundError('User not found')
    }

    return user.id
  }

  async hasBadge (userId: number, badgeId: number): Promise<boolean> {
    const client = this._robloxManager.getClient()
    return (await client.apis.inventoryAPI.getUserItemsByTypeAndTargetId({
      userId,
      itemType: 'Badge',
      itemTargetId: badgeId
    })).data.length === 1
  }

  async getUsers (userIds: number[]): Promise<GetUsers> {
    const client = this._robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
  }

  async getUsername (userId: number): Promise<string> {
    return (await this.getUser(userId)).name
  }

  async getUser (userId: number): Promise<GetUserById> {
    const client = this._robloxManager.getClient()
    return await client.apis.usersAPI.getUserById({ userId })
  }
}
