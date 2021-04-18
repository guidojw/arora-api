'use strict'

const { NotFoundError } = require('../errors')

class StatusService {
  constructor (robloxManager) {
    this._robloxManager = robloxManager
  }

  getStatus () {
    return {
      state: 'running'
    }
  }

  async getGroupClientStatus (groupId) {
    const client = this._robloxManager.getClient(groupId)
    if (!client) {
      throw new NotFoundError('Client not found.')
    }

    const authenticationData = await client.apis.usersAPI.getAuthenticatedUserInformation()
    return typeof authenticationData !== 'undefined'
  }
}

module.exports = StatusService
