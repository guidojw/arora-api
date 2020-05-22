'use strict'
const userService = require('../services/user')
const { Ban, BanCancellation } = require('../models')
const ConflictError = require('../errors/conflict')
const ForbiddenError = require('../errors/forbidden')
const NotFoundError = require('../errors/not-found')

const robloxConfig = require('../../config/roblox')

function getBans (scope) {
    return Ban.scope(scope || 'defaultScope').findAll()
}

async function ban (groupId, userId, options) {
    const ban = await Ban.findOne({ where: { userId }})
    if (ban) throw new ConflictError('User is already banned.')
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw new ForbiddenError('User is unbannable.')
    return Ban.create({
        authorId: options.authorId,
        reason: options.reason,
        userId,
        rank
    }, { individualHooks: true })
}

async function putBan (userId, options) {
    const ban = await Ban.findOne({ where: { userId }})
    if (!ban) throw new NotFoundError('Ban not found.')
    return ban.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

async function getBan (userId, scope) {
    const ban = await Ban.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!ban) throw new NotFoundError('Ban not found.')
    return ban
}

async function cancelBan (userId, authorId, reason) {
    if (authorId !== robloxConfig.ownerId) throw new ForbiddenError('Only the owner can unban.')
    const ban = await Ban.findOne({ where: { userId }})
    if (!ban) throw new NotFoundError('Ban not found.')
    return BanCancellation.create({ banId: ban.id, authorId, reason }, { individualHooks: true })
}

module.exports = {
    getBans,
    ban,
    putBan,
    getBan,
    cancelBan
}
