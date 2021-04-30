import { GetUserById, GetUsersByUserIds } from 'bloxy/src/client/apis/UsersAPI'
import { NotFoundError } from '../errors'

export default class UserService {
  _robloxManager: any

  constructor (robloxManager: any) {
    this._robloxManager = robloxManager
  }

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

  async getUsers (userIds: number[]): Promise<GetUsersByUserIds['data']> {
    const client = this._robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
  }

  async getUsername (userId: number): Promise<string> {
    return (await this.getUser(userId)).name
  }

  async getUser (userId: number): Promise<GetUserById> {
    const client = this._robloxManager.getClient()
    return client.apis.usersAPI.getUserById({ userId })
  }
}
