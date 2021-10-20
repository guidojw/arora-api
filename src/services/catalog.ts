import axios from 'axios'
import { injectable } from 'inversify'

@injectable()
export default class CatalogService {
  public async getItems (queryString: string): Promise<object[]> {
    return (await axios.get<object[]>(`https://search.roblox.com/catalog/json?${queryString}`)).data
  }
}
