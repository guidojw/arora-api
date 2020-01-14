'use strict'
const roblox = require('noblox.js')
const createError = require('http-errors')

const trelloController = require('./trello')

const timeHelper = require('../helpers/time')

const DiscordMessageJob = require('../jobs/discord-message')

exports.getBans = async () => {
    const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloController.getIdFromListName(boardId, 'Banned')
    const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
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
    const rank = await roblox.getRankInGroup(groupId, userId)
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unbannable')
    const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloController.getIdFromListName(boardId, 'Banned')
    const cards = await trelloController.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) throw createError(409, 'User is already banned')
    }
    await trelloController.postCard({
        idList: listId,
        name: userId.toString(),
        desc: JSON.stringify({
            rank: rank,
            by: by,
            reason: reason,
            at: timeHelper.getUnix()
        })
    })
    const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(userId), roblox
        .getUsernameFromId(by)])
    await (new DiscordMessageJob()).perform('log', `**${byUsername}** banned **${username}** with ` +
        `reason "*$reason}*"`)
}

exports.putBan = async (userId, options) => {
    const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloController.getIdFromListName(boardId, 'Banned')
    const cards = await trelloController.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) {
            if (options.unbanned) {
                await trelloController.putCard(card.id, {
                    idList: await trelloController.getIdFromListName(boardId, 'Unbanned')
                })
                const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(userId), roblox
                    .getUsernameFromId(options.by)])
                await (new DiscordMessageJob()).perform('log', `**${byUsername}** unbanned ` +
                    `**${username}**.`)
                return
            }
        }
    }
    throw createError(404)
}
