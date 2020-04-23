'use strict'
const createError = require('http-errors')
const userService = require('../services/user')
const models = require('../models')

exports.getBans = () => {
    return models.Ban.findAll()
}

exports.ban = async (groupId, userId, authorId, reason) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) throw createError(409, 'User is already banned')
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable')
    return models.Ban.create({
        userId,
        authorId,
        reason,
        rank
    })
}

exports.putBan = async (userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found')
    return ban.update(options)
}

exports.getBan = async userId => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found')
    return ban
}

exports.cancelBan = async (userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    await models.BanCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        banId: ban.id
    })

}
