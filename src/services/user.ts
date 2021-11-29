import type { GetUserById, GetUsersByUserIds } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import { inject, injectable } from 'inversify'
import { NotFoundError } from '../errors'
import { RobloxManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export type GetUsers = GetUsersByUserIds['data']

@injectable()
export default class UserService {
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager

  public async getUserIdFromUsername (username: string): Promise<number> {
    const client = this.robloxManager.getClient()
    const user = await client.getUserIdFromUsername(username)

    // This Roblox endpoint doesn't throw HTTP 404 if a user doesn't exist..
    if (typeof user.id === 'undefined') {
      throw new NotFoundError('User not found')
    }

    return user.id
  }

  public async hasBadge (userId: number, badgeId: number): Promise<boolean> {
    const client = this.robloxManager.getClient()
    return (await client.apis.inventoryAPI.getUserItemsByTypeAndTargetId({
      userId,
      itemType: 'Badge',
      itemTargetId: badgeId
    })).data.length === 1
  }

  public async getUsers (userIds: number[]): Promise<GetUsers> {
    const client = this.robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
  }

  public async getUsername (userId: number): Promise<string> {
    return (await this.getUser(userId)).name
  }

  public async getUser (userId: number): Promise<GetUserById> {
    const client = this.robloxManager.getClient()
    return await client.apis.usersAPI.getUserById({ userId })
  }
}
