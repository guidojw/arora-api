import axios from 'axios'

export default class CatalogService {
  async getItems (queryString: string): Promise<object[]> {
    return (await axios.get(`https://search.roblox.com/catalog/json?${queryString}`)).data
  }
}
