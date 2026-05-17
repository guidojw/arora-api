import { injectable } from 'inversify'
import { robloxOpenCloudAdapter } from '../adapters'

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
  public async getUsername (userId: number): Promise<string> {
    return (await this.getUser(userId)).name
  }

  public async getUser (userId: number): Promise<GetUser> {
    return (await robloxOpenCloudAdapter('GET', `users/${userId}`)).data
  }
}
