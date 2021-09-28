import { RESTRequestOptions, RESTResponseDataType } from '@guidojw/bloxy/dist/interfaces/RESTInterfaces'
import BaseManager from './base'
import { Client } from '@guidojw/bloxy'
import type { Method } from 'axios'
import axios from 'axios'
import { injectable } from 'inversify'

@injectable()
export default class RobloxManager implements BaseManager {
  private readonly authenticatedClients: Record<number, Client> = {}
  private readonly unauthenticatedClient: Client

  public constructor () {
    // Unauthenticated client with custom requester.
    this.unauthenticatedClient = new Client({ rest: { requester } })
  }

  public async init (): Promise<void> {
    // Authenticated client(s)
    try {
      const client = new Client({ rest: { requester } })

      await client.login(process.env.ROBLOX_COOKIE)
      console.log('Roblox account logged in!')

      const groups = await client.user?.getGroups()
      const groupIds = groups?.data.map(group => group.group.id) ?? []
      for (const groupId of groupIds) {
        this.authenticatedClients[groupId] = client
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  public getClient (groupId?: number): Client {
    return typeof groupId !== 'undefined'
      ? this.authenticatedClients[groupId] ?? this.unauthenticatedClient
      : this.unauthenticatedClient
  }
}

// Custom Bloxy requester that adapts Got requests to Axios.
async function requester (options: RESTRequestOptions): Promise<RESTResponseDataType> {
  try {
    const response = await axios({
      url: options.url,
      method: options.method as Method,
      headers: options.headers,
      params: options.qs,
      data: options.body
    })
    return {
      body: response.data,
      statusMessage: response.statusText,
      statusCode: response.status,
      headers: response.headers
    }
  } catch (err) {
    if (axios.isAxiosError(err) && typeof err.response !== 'undefined') {
      // Don't throw token validation errors because Bloxy's token refresh
      // mechanism relies on these being successfully returned.
      if ((options.xcsrf === false && options.url === 'https://auth.roblox.com/v2/login') ||
        (err.response.status === 403 && err.response.statusText.includes('Token Validation Failed'))) {
        return {
          body: err.response.data,
          statusMessage: err.response.statusText,
          statusCode: err.response.status,
          headers: err.response.headers
        }
      }
    }
    throw err
  }
}
