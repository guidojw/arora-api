'use strict'
const createError = require('http-errors')
const userService = require('../services/user')
const models = require('../models')

const robloxConfig = require('../../config/roblox')

exports.getBans = (query) => {
    return models.Ban.scope(query.scope).findAll()
}

exports.ban = async (groupId, userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) throw createError(409, 'User is already banned')
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable')
    return models.Ban.create({
        authorId: options.authorId,
        reason: options.reason,
        userId,
        rank
    }, { individualHooks: true })
}

exports.putBan = async (userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found')
    return ban.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

exports.getBan = async (userId, query) => {
    const ban = await models.Ban.scope(query.scope).findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found')
    return ban
}

exports.cancelBan = async (userId, authorId, reason) => {
    if (authorId !== robloxConfig.ownerId) createError(403, 'Only the owner can unban')
    const ban = await models.Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found')
    return models.BanCancellation.create({ banId: ban.id, authorId, reason }, { individualHooks: true })
}
