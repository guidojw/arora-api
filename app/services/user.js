'use strict'
const { NotFoundError } = require('../errors')

const robloxConfig = require('../../config/roblox')

class UserService {
  constructor (robloxManager) {
    this._robloxManager = robloxManager
  }

  async getUserIdFromUsername (username) {
    const client = this._robloxManager.getClient()
    const user = await client.getUserIdFromUsername(username)

    // This Roblox endpoint doesn't throw HTTP 404 if a user doesn't exist..
    if (user.id === undefined) {
      throw new NotFoundError('User not found')
    }

    return user.id
  }

  async hasBadge (userId, badgeId) {
    const client = this._robloxManager.getClient(robloxConfig.defaultGroup)
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

  async getRank (userId, groupId) {
    const client = this._robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    return group ? group.role.rank : 0
  }

  async getRole (userId, groupId) {
    const client = this._robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    return group ? group.role.name : 'Guest'
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
