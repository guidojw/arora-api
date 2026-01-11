import { inject, injectable } from 'inversify'
import type { GetUsersByUserIds } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import { NotFoundError } from '../errors'
import { RobloxManager } from '../managers'
import { constants } from '../util'
import { robloxOpenCloudAdapter } from '../adapters'

const { TYPES } = constants

export type GetUsers = GetUsersByUserIds['data']

export interface GetUser {
  readonly path: string
  readonly createTime: string
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly about: string
  readonly locale: string
  readonly premium: boolean
  readonly idVerified?: boolean
  readonly socialNetworkProfiles?: Record<string, string>
}

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

  public async getUsers (userIds: number[]): Promise<GetUsers> {
    const client = this.robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
  }

  public async getUsername (userId: number): Promise<string> {
    return (await this.getUser(userId)).name
  }

  public async getUser (userId: number): Promise<GetUser> {
    return (await robloxOpenCloudAdapter('GET', `users/${userId}`)).data
  }
}
