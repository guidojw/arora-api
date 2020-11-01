'use strict'
const axios = require('axios')

class CatalogService {
  async getItems (queryString) {
    return (await axios({
      method: 'get',
      url: `https://search.roblox.com/catalog/json?${queryString}`
    })).data
  }
}

module.exports = CatalogService
