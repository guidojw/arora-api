'use strict'
const userService = require('../services/user')
const { Ban, BanCancellation } = require('../models')
const ConflictError = require('../errors/conflict')
const ForbiddenError = require('../errors/forbidden')
const NotFoundError = require('../errors/not-found')

const robloxConfig = require('../../config/roblox')

exports.getBans = scope => {
    return Ban.scope(scope || 'defaultScope').findAll()
}

exports.ban = async (groupId, userId, { authorId, reason }) => {
    if (await Ban.findOne({ where: { userId }})) throw new ConflictError('User is already banned.')
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw new ForbiddenError('User is unbannable.')
    return Ban.create({
        authorId,
        reason,
        userId,
        rank
    }, { individualHooks: true })
}

exports.putBan = async (userId, { changes, editorId }) => {
    const ban = await exports.getBan(userId)
    return ban.update(changes, { editorId, individualHooks: true })
}

exports.getBan = async (userId, scope) => {
    const ban = await Ban.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!ban) throw new NotFoundError('Ban not found.')
    return ban
}

exports.cancelBan = async (userId, authorId, reason) => {
    if (authorId !== robloxConfig.ownerId) throw new ForbiddenError('Only the owner can unban.')
    const ban = await exports.getBan(userId)
    return BanCancellation.create({ banId: ban.id, authorId, reason }, { individualHooks: true })
}
