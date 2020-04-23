'use strict'
const createError = require('http-errors')
const discordMessageJob = require('../jobs/discord-message')
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
    const [username, authorUsername] = await Promise.all([userService.getUsername(userId), userService
        .getUsername(authorId)])
    await discordMessageJob('log', `**${authorUsername}** banned **${username}** with reason "*${reason
    }*"`)
    return models.Ban.create({
        userId,
        authorId,
        reason,
        rank
    })
}

exports.putBan = async (userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) {
        const [username, editorUsername] = await Promise.all([userService.getUsername(userId), userService
            .getUsername(options.editorId)])
        if (options.cancelled) {
            const cancellation = await models.BanCancellation.create({
                banId: ban.id,
                authorId: options.editorId,
                reason: options.reason
            })
            await discordMessageJob('log', `**${editorUsername}** unbanned **${username}** with reason` +
                ` "*${cancellation.reason}*"`)
        }
        if (options.authorId) {
            const newAuthorUsername = await userService.getUsername(options.authorId)
            await ban.update({ authorId: options.authorId })
            await discordMessageJob('log', `**${editorUsername}** changed the author of **${username}*` +
                `*'s ban to **${newAuthorUsername}**`)
        }
        if (options.reason && options.cancelled === undefined) {
            await ban.update({ reason: options.reason })
            await discordMessageJob('log', `**${editorUsername}** changed the reason of **${username}*` +
                `*'s ban to *"${ban.reason}"*`)
        }
        return ban
    }
    throw createError(404, 'Ban not found')
}

exports.getBan = async userId => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) return ban
    throw createError(404, 'Ban not found')
}
