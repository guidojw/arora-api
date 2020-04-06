'use strict'
const createError = require('http-errors')
const trelloService = require('./trello')
const discordMessageJob = require('../jobs/discord-message')
const userService = require('../services/user')

exports.getBans = async () => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Banned')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    let bans = []
    for (const card of cards) {
        const ban = JSON.parse(card.desc)
        ban.userId = parseInt(card.name)
        await bans.push(ban)
    }
    return bans
}

exports.ban = async (groupId, userId, by, reason) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable')
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Banned')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) throw createError(409, 'User is already banned')
    }
    const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService.getUsername(
        by)])
    await discordMessageJob('log', `**${byUsername}** banned **${username}** with reason "*${reason}*"`)
    return trelloService.postCard({
        idList: listId,
        name: userId.toString(),
        desc: JSON.stringify({
            rank,
            by,
            reason,
            at: Math.round(Date.now() / 1000)
        })
    })
}

exports.putBan = async (userId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Banned')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) {
            const cardOptions = {}
            const ban = JSON.parse(card.desc)
            const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService
                .getUsername(options.byUserId)])
            if (options.unbanned) {
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Unbanned')
                await discordMessageJob('log', `**${byUsername}** unbanned **${username}**`)
            } else if (options.by) {
                cardOptions.by = options.by
                const newByUsername = await userService.getUsername(options.by)
                await discordMessageJob('log', `**${byUsername}** changed the author of **${username}*` +
                    `*'s ban to **${newByUsername}**`)
            } else if (options.reason) {
                cardOptions.reason = options.reason
                await discordMessageJob('log', `**${byUsername}** changed the reason of **${username}*` +
                    `*'s ban to *"${options.reason}"*`)
            }
            cardOptions.desc = JSON.stringify(ban)
            return trelloService.putCard(card.id, cardOptions)
        }
    }
    throw createError(404, 'Ban not found')
}

exports.getBan = async userId => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Banned')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        const ban = JSON.parse(card.desc)
        ban.userId = parseInt(card.name)
        if (ban.userId === userId) return ban
    }
    throw createError(404, 'Ban not found')
}
