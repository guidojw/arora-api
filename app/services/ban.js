'use strict'
const createError = require('http-errors')
const discordMessageJob = require('../jobs/discord-message')
const userService = require('../services/user')
const models = require('../models')

exports.getBans = () => {
    return models.Ban.findAll()
}

exports.ban = async (groupId, userId, authorId, reason) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable')
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) throw createError(409, 'User is already banned')
    const [username, authorUsername] = await Promise.all([userService.getUsername(userId), userService
        .getUsername(authorId)])
    await discordMessageJob('log', `**${authorUsername}** banned **${username}** with reason "*${reason
    }*"`)
    return models.Ban.create({
        userId,
        authorId,
        reason,
        rank,
        date: Date.now()
    })
}

exports.putBan = async (userId, options) => {
    const ban = await models.Ban.findOne({ where: { userId }})
    if (ban) {
        const [username, editorUsername] = await Promise.all([userService.getUsername(userId), userService
            .getUsername(options.editorId)])
        if (options.unbanned) {
            await models.BanCancellation.create({ banId: ban.id, authorId: options.authorId, reason: options.reason })
            await discordMessageJob('log', `**${editorUsername}** unbanned **${username}**`)
        } else if (options.authorId) {
            await ban.update({ authorId: options.authorId })
            const newAuthorUsername = await userService.getUsername(options.authorId)
            await discordMessageJob('log', `**${editorUsername}** changed the author of **${username}*` +
                `*'s ban to **${newAuthorUsername}**`)
        } else if (options.reason) {
            await ban.update({ reason: options.reason })
            await discordMessageJob('log', `**${editorUsername}** changed the reason of **${username}*` +
                `*'s ban to *"${options.reason}"*`)
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
