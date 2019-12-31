'use strict'
const { param, body, oneOf } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')

const timeHelper = require('../../helpers/time')

const DiscordMessageJob = require('../../jobs/discord-message-job')

const trelloController = require('./trello')

exports.validate = method => {
    switch (method) {
        case 'getBans':
            return [
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'ban':
            return [
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('userId').exists().isNumeric(),
                body('by').exists().isNumeric(),
                body('reason').exists().isString(),
                body('groupId').exists().isNumeric()
            ]
        case 'putBan':
            return oneOf([
                param('userId').exists().isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('by').exists().isNumeric(),
                body('unbanned').exists().isBoolean()
            ])
    }
}

exports.getBans = async (req, res, next) => {
    try {
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
        res.json(bans)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.ban = async (req, res, next) => {
    try {
        const rank = await roblox.getRankInGroup(req.body.groupId, req.body.userId)
        if (rank >= 200 || rank === 99 || rank === 103) return next(createError(403, 'User is unbannable'))
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Banned')
        const cards = await trelloController.getCards(listId, {fields: 'name'})
        for (const card of cards) {
            if (parseInt(card.name) === req.body.userId) return next(createError(409, 'User is already banned'))
        }
        await trelloController.postCard({
            idList: listId,
            name: req.body.userId.toString(),
            desc: JSON.stringify({
                rank: rank,
                by: req.body.by,
                reason: req.body.reason,
                at: timeHelper.getUnix()
            })
        })
        const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(req.body.userId), roblox
            .getUsernameFromId(req.body.by)])
        new DiscordMessageJob().perform('log', `**${byUsername}** banned **${username}** with reason ` +
            `"*${req.body.reason}*"`)
        res.sendStatus(200)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.putBan = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Banned')
        const cards = await trelloController.getCards(listId, {fields: 'name'})
        for (const card of cards) {
            if (parseInt(card.name) === req.body.userId) {
                if (req.body.unbanned) {
                    await trelloController.putCard(card.id, {
                        idList: await trelloController.getIdFromListName(boardId, 'Unbanned')
                    })
                    const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(req.body.userId),
                        roblox.getUsernameFromId(req.body.by)])
                    new DiscordMessageJob().perform('log', `**${byUsername}** unbanned **${username}**.`)
                    return res.sendStatus(200)
                }
            }
        }
        next(createError(404))
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
