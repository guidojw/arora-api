'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')

const timeUtils = require('../utils/timeUtils')

const DiscordMessageJob = require('../jobs/discord-message-job')

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
                body('reason').exists().isString()
            ]
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
        const rank = await roblox.getRankInGroup(req.params.groupId, req.body.userId)
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
                at: timeUtils.getUnix()
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
