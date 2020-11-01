'use strict'
const { NotFoundError } = require('../errors')

class StatusService {
  constructor (robloxManager) {
    this._robloxManager = robloxManager
  }

  async getStatus (groupId) {
    const client = this._robloxManager.getClient(groupId)
    if (!client) {
      throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return authenticationData !== undefined
  }
}

module.exports = StatusService
