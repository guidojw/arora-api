'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')
const pluralize = require('pluralize')

const timeUtils = require('../utils/timeUtils')

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
        case 'getSuspension':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'getTraining':
            return [
                param('groupId').isNumeric(),
                param('trainingId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'shout':
            return [
                param('groupId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('by').exists().isNumeric(),
                body('shout').optional().isNumeric()
            ]
    }
}

exports.suspend = async (req, res, next) => {
    try {
        const rank = await roblox.getRankInGroup(req.params.groupId, req.body.userId)
        if (rank === 2) return next(createError(409, 'User is already suspended'))
        if (rank >= 200 || rank === 99 || rank === 103) return next(createError(403, 'User is unsuspendable'))
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Current')
        const cards = await trelloController.getCards(listId, {fields: 'name'})
        for (const card of cards) {
            if (parseInt(card.name) === req.body.userId) return next(createError(409, 'User is already suspended'))
        }
        if (rank > 0 && rank !== 2) {
            await roblox.setRank(req.params.groupId, req.body.userId, 2)
        }
        await trelloController.postCard({
            idList: listId,
            name: req.body.userId.toString(),
            desc: JSON.stringify({
                rank: rank,
                rankback: req.body.rankback,
                duration: req.body.duration,
                by: req.body.by,
                reason: req.body.reason,
                at: timeUtils.getUnix()
            })
        })
        const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(req.body.userId), roblox
            .getUsernameFromId(req.body.by)])
        const days = req.body.duration / 86400
        new DiscordMessageJob().perform('log', `**${byUsername}** suspended **${username}** for ` +
            `**${days} ${pluralize('day', days)}** with reason "*${req.body.reason}*"`)
        res.sendStatus(200)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getRank = async (req, res, next) => {
    try {
        res.json(await roblox.getRankInGroup(req.params.groupId, req.params.userId))
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
        res.json(await roblox.getShout(req.params.groupId))
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getRole = async (req, res, next) => {
    try {
        res.json(await roblox.getRankNameInGroup(req.params.groupId, req.params.userId))
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

exports.getSuspension = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Current')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        for (const card of cards) {
            const userId = parseInt(card.name)
            if (userId === req.params.userId) {
                const suspension = {}
                suspension.userId = userId
                for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
                    suspension[key] = value
                }
                res.json(suspension)
            }
        }
        res.json(null)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getTraining = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Training Scheduler')
        const listId = await trelloController.getIdFromListName(boardId, 'Scheduled')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        for (const card of cards) {
            const trainingId = parseInt(card.name)
            if (trainingId === req.params.trainingId) {
                const training = {}
                training.id = trainingId
                for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
                    training[key] = value
                }
                res.json(training)
            }
        }
        res.json(null)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.shout = async (req, res, next) => {
    try {
        const byUsername = await roblox.getUsernameFromId(req.body.by)
        const shout = (await roblox.shout(req.params.groupId, req.body.shout ? req.body.shout : '')).data
        if (shout.body === '') {
            new DiscordMessageJob().perform('log', `**${byUsername}** cleared the shout`)
        } else {
            new DiscordMessageJob().perform('log', `**${byUsername}** shouted *"${shout.body}"*`)
        }
        res.json(shout)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
