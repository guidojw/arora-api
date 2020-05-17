'use strict'
const createError = require('http-errors')
const { userService } = require('../services')
const { Ban, BanCancellation } = require('../models')

const robloxConfig = require('../../config/roblox')

function getBans (scope) {
    return Ban.scope(scope || 'defaultScope').findAll()
}

async function ban (groupId, userId, options) {
    const ban = await Ban.findOne({ where: { userId }})
    if (ban) throw createError(409, 'User is already banned.')
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable.')
    return Ban.create({
        authorId: options.authorId,
        reason: options.reason,
        userId,
        rank
    }, { individualHooks: true })
}

async function putBan (userId, options) {
    const ban = await Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found.')
    return ban.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

async function getBan (userId, scope) {
    const ban = await Ban.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found.')
    return ban
}

async function cancelBan (userId, authorId, reason) {
    if (authorId !== robloxConfig.ownerId) createError(403, 'Only the owner can unban.')
    const ban = await Ban.findOne({ where: { userId }})
    if (!ban) throw createError(404, 'Ban not found.')
    return BanCancellation.create({ banId: ban.id, authorId, reason }, { individualHooks: true })
}

module.exports = {
    getBans,
    ban,
    putBan,
    getBan,
    cancelBan
}
