import * as crypto from 'node:crypto'
import { BadRequestError, NotFoundError } from '../errors'
import { inject, injectable } from 'inversify'
import { AccessToken } from '../entities'
import { RedisClientType } from 'redis'
import { Repository } from 'typeorm'
import { WebSocketManager } from '../managers'
import axios from 'axios'
import { constants } from '../util'
import { plainToInstance } from 'class-transformer'
import { robloxOAuthAdapter } from '../adapters'

const { TYPES } = constants

@injectable()
export default class OAuthService {
  @inject(TYPES.RedisClient)
  private readonly redisClient!: RedisClientType

  @inject(TYPES.AccessTokenRepository)
  private readonly accessTokenRepository!: Repository<AccessToken>

  @inject(TYPES.WebSocketManager)
  private readonly webSocketManager!: WebSocketManager

  public async handleCallback (state: string, code: string): Promise<void> {
    const id = await this.redisClient.get(`state:${state}`)
    if (id === null) {
      throw new BadRequestError()
    }

    const result = await robloxOAuthAdapter('POST', 'token', {
      code,
      grant_type: 'authorization_code'
    })
    await this.accessTokenRepository.save(this.accessTokenRepository.create(plainToInstance(
      AccessToken,
      {
        ...result.data,
        id
      }
    )))

    this.webSocketManager.broadcast('robloxUserVerify', { id })
  }

  public async verifyRobloxUser (id: string): Promise<{ authorizationUrl: string }> {
    const state = crypto.randomBytes(16).toString('hex')
    const authorizationUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_APP_CLIENT_ID as string}` +
      `&redirect_uri=${process.env.ROBLOX_APP_REDIRECT_URI as string}` +
      '&scope=openid%20profile' +
      '&response_type=code' +
      `&state=${state}`

    await this.redisClient.set(`state:${state}`, id, { expiration: { type: 'EX', value: 15 * 60 } })

    return { authorizationUrl }
  }

  public async getRobloxAccessToken (id: string): Promise<Pick<AccessToken, 'accessToken' | 'tokenType' | 'scope'>> {
    let accessToken = await this.accessTokenRepository.findOne({ where: { id } })
    if (typeof accessToken === 'undefined') {
      throw new NotFoundError('Access token not found.')
    }

    const result = await robloxOAuthAdapter('POST', 'token/introspect', {
      token: accessToken.accessToken
    })
    if (result.data.active === false) {
      try {
        const result = await robloxOAuthAdapter('POST', 'token', {
          grant_type: 'refresh_token',
          refresh_token: accessToken.refreshToken
        })
        accessToken = await this.accessTokenRepository.save(this.accessTokenRepository.create(plainToInstance(
          AccessToken,
          {
            ...result.data,
            id
          }
        )))
      } catch (err) {
        if (axios.isAxiosError(err) && typeof err.response !== 'undefined' && err.response.status === 400) {
          await this.accessTokenRepository.delete(accessToken.id)
        }
        throw err
      }
    }

    return {
      accessToken: accessToken.accessToken,
      tokenType: accessToken.tokenType,
      scope: accessToken.scope
    }
  }
}
