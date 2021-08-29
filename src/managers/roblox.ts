import { RESTRequestOptions, RESTRequester, RESTResponseDataType } from '@guidojw/bloxy/dist/interfaces/RESTInterfaces'
import BaseManager from './base'
import { Client } from '@guidojw/bloxy'
import { HTTPError } from 'got'
import { injectable } from 'inversify'

@injectable()
export default class RobloxManager implements BaseManager {
  private readonly authenticatedClients: Record<number, Client> = {}
  private readonly unauthenticatedClient: Client

  public constructor () {
    // Unauthenticated client
    const client = new Client()
    // Set the client's requester to the custom requester. Needs to be done
    // after instantiation as we need to know what the original requester was.
    client.rest.requester = requester.bind(client.rest.requester)
    this.unauthenticatedClient = client
  }

  public async init (): Promise<void> {
    // Authenticated client(s)
    try {
      const client = new Client()
      // Set custom requester again, like with the unauthenticated client.
      client.rest.requester = requester.bind(client.rest.requester)

      await client.login(process.env.ROBLOX_COOKIE)
      console.log('Roblox account logged in!')

      const groups = await client.user?.getGroups()
      const groupIds = groups?.data.map(group => group.group.id) ?? []
      for (const groupId of groupIds) {
        this.authenticatedClients[groupId] = client
      }
    } catch (err) {
      console.error(err.message)
    }
  }

  public getClient (groupId?: number): Client {
    return typeof groupId !== 'undefined'
      ? this.authenticatedClients[groupId] ?? this.unauthenticatedClient
      : this.unauthenticatedClient
  }
}

// Custom requester that uses Bloxy's default requester but
// enables its throwHttpErrors option as the project relies on that.
async function requester (this: RESTRequester, options: RESTRequestOptions): Promise<RESTResponseDataType> {
  // HTTP 403s are thrown on fetching new X-CSRF tokens, Bloxy's token refresh
  // mechanism however relies on this so don't throw HTTP errors then.
  if (options.xcsrf !== false && options.url !== 'https://auth.roblox.com/v2/login') {
    options.throwHttpErrors = true
  }

  try {
    // this refers to Bloxy's original requester.
    return await this(options)
  } catch (err: any) {
    if (err instanceof HTTPError) {
      if (typeof err.response !== 'undefined' && err.response.statusCode === 403 && (err.response.statusMessage as
        string).includes('Token Validation Failed')) {
        return err.response as RESTResponseDataType
      }
    }
    throw err
  }
}
