'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')
const pluralize = require('pluralize')

const DiscordMessageJob = require('../jobs/discord-message-job')

const trelloController = require('./trello')

exports.validate = method => {
    switch (method) {
        case 'suspend':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('byUserId').exists().isNumeric(),
                body('reason').exists().isString(),
                body('duration').exists().isNumeric()
            ]
        case 'getRank':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'promote':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('byUserId').optional().isNumeric()
            ]
        case 'getShout':
            return [
                param('groupId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'getRole':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'getSuspensions':
            return [
                param('groupId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'getTrainings':
            return [
                param('groupId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}

exports.suspend = async (req, res, next) => {
    try {
        const rank = await roblox.getRankInGroup(req.params.groupId, req.params.userId)
        if (rank >= 200) next(createError(403, 'Can\'t suspend HRs'))
        const [username, byUsername] = await Promise.all(roblox.getUsernameFromId(req.params.userId), roblox
            .getUsernameFromId(req.body.byUserId))
        const roles = await roblox.setRank(req.params.groupId, req.params.userId)
        new DiscordMessageJob().perform('log', `**${byUsername}** suspended **${username}** for ` +
            `**${req.body.duration} ${pluralize(req.body.duration, 'day')}** with reason "*${req.body.reason}*"`)
        res.send(roles)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getRank = async (req, res, next) => {
    try {
        const rank = await roblox.getRankInGroup(req.params.groupId, req.params.userId)
        res.json(rank)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.promote = async (req, res, next) => {
    try {
        const rank = await roblox.getRankInGroup(req.params.groupId, req.params.userId)
        console.log(req.params.groupId, req.params.userId)
        if (rank === 0) next(createError(403, 'Can only promote group members'))
        if (rank >= 100) next(createError(403, 'Can\'t promote MRs or higher'))
        const username = await roblox.getUsernameFromId(req.params.userId)
        const roles = await roblox.changeRank(req.params.groupId, req.params.userId, rank === 1 ? 2 : 1)
        if (req.body.byUserId) {
            const byUsername = await roblox.getUsernameFromId(req.body.byUserId)
            new DiscordMessageJob().perform('log', `**${byUsername}** promoted **${username}** from ` +
                `**${roles.oldRole.name}** to **${roles.newRole.name}**`)
        } else {
            new DiscordMessageJob().perform('log', `Promoted **${username}** from ` +
                `**${roles.oldRole.name}** to **${roles.newRole.name}**`)
        }
        res.send(roles)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getShout = async (req, res, next) => {
    try {
        const shout = await roblox.getShout(req.params.groupId)
        res.json(shout)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getRole = async (req, res, next) => {
    try {
        const role = await roblox.getRankNameInGroup(req.params.groupId, req.params.userId)
        res.json(role)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getSuspensions = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId,'Current')
        const cards = await trelloController.getCards(listId, {fields: 'desc'})
        res.json(cards)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getTrainings = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Training Scheduler')
        const listId = await trelloController.getIdFromListName(boardId,'Scheduled')
        const trainings = await trelloController.getCards(listId, {fields: 'desc'})
        res.json(trainings)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
