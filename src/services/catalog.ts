import { inject, injectable } from 'inversify'
import BaseAPI from '@guidojw/bloxy/dist/client/apis/BaseAPI'
import type { Client } from '@guidojw/bloxy'
import type { RobloxManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class CatalogService {
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager

  public async getItems (queryString: string): Promise<{}> {
    const client = this.robloxManager.getAuthenticatedClient() ?? this.robloxManager.getClient()
    const api = new CatalogAPI(client)
    return await api.getItems(queryString)
  }
}

class CatalogAPI extends BaseAPI {
  public constructor (client: Client) {
    super({
      client,
      baseUrl: 'https://apis.roblox.com/toolbox-service/'
    })
  }

  public async getItems (queryString: string): Promise<{}> {
    return (await this.request({
      requiresAuth: true,
      request: {
        path: `v1/marketplace/300?${queryString}`
      },
      json: true
    })).body
  }
}
