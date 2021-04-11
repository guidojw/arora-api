'use strict'

const { NotFoundError } = require('../errors')

class UserService {
  constructor (robloxManager) {
    this._robloxManager = robloxManager
  }

  async getUserIdFromUsername (username) {
    const client = this._robloxManager.getClient()
    const user = await client.getUserIdFromUsername(username)

    // This Roblox endpoint doesn't throw HTTP 404 if a user doesn't exist..
    if (typeof user.id === 'undefined') {
      throw new NotFoundError('User not found')
    }

    return user.id
  }

  async hasBadge (userId, badgeId) {
    const client = this._robloxManager.getClient()
    return (await client.apis.inventoryAPI.getUserItemsByTypeAndTargetId({
      userId,
      itemType: 'Badge',
      itemTargetId: badgeId
    })).data.length === 1
  }

  async getUsers (userIds) {
    const client = this._robloxManager.getClient()
    return (await client.apis.usersAPI.getUsersByIds({ userIds })).data
  }

  async getUsername (userId) {
    return (await this.getUser(userId)).name
  }

  getUser (userId) {
    const client = this._robloxManager.getClient()
    return client.apis.usersAPI.getUserById({ userId })
  }
}

module.exports = UserService
