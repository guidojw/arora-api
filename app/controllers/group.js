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
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('userId').exists().isNumeric(),
                body('by').exists().isNumeric(),
                body('reason').exists().isString(),
                body('duration').exists().isNumeric(),
                body('rankback').exists().isNumeric()
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
                body('by').optional().isNumeric()
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
        case 'hostTraining':
            return [
                param('groupId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('by').exists().isString(),
                body('type').exists().isString(),
                body('date').exists().isString(),
                body('specialnotes').optional().isString()
            ]
        case 'getExiles':
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
        if (rank >= 200) return next(createError(403, 'Can\'t suspend HRs'))
        const [username, byUsername] = await Promise.all(roblox.getUsernameFromId(req.params.userId), roblox
            .getUsernameFromId(req.body.byUserId))
        const roles = await roblox.setRank(req.params.groupId, req.params.userId, 2)
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
        if (rank === 0) return next(createError(403, 'Can only promote group members'))
        if (rank >= 100) return next(createError(403, 'Can\'t promote MRs or higher'))
        const username = await roblox.getUsernameFromId(req.params.userId)
        const roles = await roblox.changeRank(req.params.groupId, req.params.userId, rank === 1 ? 2 : 1)
        if (req.body.byUserId) {
            const byUsername = await roblox.getUsernameFromId(req.body.by)
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
        const listId = await trelloController.getIdFromListName(boardId, 'Current')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        let suspensions = []
        for (const card of cards) {
            const suspension = {}
            suspension.userId = parseInt(card.name)
            for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
                suspension[key] = value
            }
            await suspensions.push(suspension)
        }
        res.json(suspensions)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getTrainings = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Training Scheduler')
        const listId = await trelloController.getIdFromListName(boardId, 'Scheduled')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        let trainings = []
        for (const card of cards) {
            const training = {}
            training.id = parseInt(card.name)
            for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
                training[key] = value
            }
            await trainings.push(training)
        }
        res.json(trainings)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.hostTraining = async (req, res, next) => {
    try {

    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getExiles = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Exiled')
        const cards = await trelloController.getCards(listId, {fields: 'name'})
        let exiles = []
        for (const card of cards) {
            const exile = {}
            exile.userId = parseInt(card.name)
            await exiles.push(exile)
        }
        res.json(exiles)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
