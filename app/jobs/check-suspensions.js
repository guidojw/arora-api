'use strict'
const groupService = require('../services/group')
const robloxManager = require ('../managers/roblox')
const finishSuspensionJob = require('../jobs/finish-suspension')
const sequelize = require('sequelize')
const models = require('../models')

module.exports = async groupId => {
    const client = robloxManager.getClient()
    const roles = await groupService.getRoles(groupId)
    const role = roles.roles.find(role => role.rank === 2)
    const suspendeds = await client.apis.groups.getMembersWithRole({ groupId, roleId: role.id })
    for (const suspended of suspendeds.data) {
        const suspension = await models.Suspension.unscoped().findAll({
            where: { userId: suspended.userId },
            attributes: [sequelize.fn('MAX', sequelize.col('id'))]
        })[0]
        if (suspension && suspension.endDate < Date.now()) finishSuspensionJob(suspension)
    }
}
