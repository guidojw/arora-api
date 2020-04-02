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
        const ban = {}
        ban.userId = parseInt(card.name)
        for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
            ban[key] = value
        }
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
    await trelloService.postCard({
        idList: listId,
        name: userId.toString(),
        desc: JSON.stringify({
            rank: rank,
            by: by,
            reason: reason,
            at: Math.round(Date.now() / 1000)
        })
    })
    const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService.getUsername(
        by)])
    await discordMessageJob('log', `**${byUsername}** banned **${username}** with reason "*${reason}*"`)
}

exports.putBan = async (userId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Banned')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) {
            if (options.unbanned) {
                await trelloService.putCard(card.id, {
                    idList: await trelloService.getIdFromListName(boardId, 'Unbanned')
                })
                const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService
                    .getUsername(options.by)])
                await discordMessageJob('log', `**${byUsername}** unbanned **${username}**`)
                return
            }
        }
    }
    throw createError(404)
}
