'use strict'
const { param, body, oneOf } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')
const pluralize = require('pluralize')
const axios = require('axios')

const timeHelper = require('../../helpers/time')

const DiscordMessageJob = require('../../jobs/discord-message-job')

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
                body('date').exists().isNumeric(),
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
                body('message').exists().isString()
            ]
        case 'putTraining': // This is ugly because epxress-validator doesn't support nested oneOf
            return oneOf([
                [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('type').exists().isString()
                ], [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('date').exists().isNumeric()
                ], [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('specialnotes').exists().isString()
                ], [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('by').exists().isString()
                ], [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean(),
                    body('by').exists().isString()
                ], [
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('finished').exists().isBoolean(),
                    body('by').exists().isString()
                ]
            ])
            /*return [
                param('groupId').isNumeric(),
                param('trainingId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                oneOf([
                    body('type').exists().isString(),
                    body('date').exists().isNumeric(),
                    body('specialnotes').exists().isString(),
                    body('by').exists().isString()
                    [
                        body('cancelled').exists().isBoolean(),
                            body('reason').exists().isBoolean(),
                            body('by').exists().isString()
                        ],
                    [
                        body('finished').exists().isBoolean(),
                        body('by').exists().isString()
                    ]
                    ])
            ]*/
        case 'putSuspension':
            return oneOf([
                [
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('by').exists().isNumeric()
                ], [
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('reason').exists().isString()
                ], [
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('rankback').exists().isNumeric()
                ], [
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean(),
                    body('by').exists().isNumeric()
                ], [
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('id').exists().isNumeric(),
                    body('key').exists().isString(),
                    body('extended').exists().isBoolean(),
                    body('duration').exists().isNumeric(),
                    body('reason').exists().isString(),
                    body('by').exists().isNumeric()
                ]
            ])
            /*return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                oneOf([
                    body('by').exists().isNumeric(),
                    body('reason').exists().isString(),
                    body('rankback').exists().isNumeric(),
                        [
                        body('cancelled').exists().isBoolean(),
                            body('reason').exists().isBoolean(),
                            body('by').exists().isNumeric()
                        ],
                    [
                        body('extended').exists().isBoolean(),
                        body('duration').exists().isNumeric(),
                        body('reason').exists().isString(),
                        body('by').exists().isNumeric()
                    ]
                ])
            ]*/
        case 'getGroup':
            return [
                param('groupId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString(),
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
                at: timeHelper.getUnix()
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
            new DiscordMessageJob().perform('log', `Promoted **${username}** from **` +
                `${roles.oldRole.name}** to **${roles.newRole.name}**`)
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
            const suspension = JSON.parse(card.desc)
            suspension.userId = parseInt(card.name)
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
            const training = JSON.parse(card.desc)
            training.id = parseInt(card.name)
            await trainings.push(training)
        }
        res.json(trainings)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.hostTraining = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Training Scheduler')
        const listId = await trelloController.getIdFromListName(boardId, 'Scheduled')
        const trainingId = await trelloController.getCardsNumOnBoard(boardId) + 1
        await trelloController.postCard({
            idList: listId,
            name: trainingId.toString(),
            desc: JSON.stringify({
                by: req.body.by,
                type: req.body.type,
                date: req.body.date,
                specialnotes: req.body.specialnotes,
                at: timeHelper.getUnix()
            })
        })
        res.json(trainingId)
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
                const suspension = JSON.parse(card.desc)
                suspension.userId = userId
                return res.json(suspension)
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
                const training = JSON.parse(card.desc)
                training.id = trainingId
                return res.json(training)
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
        await roblox.shout(req.params.groupId, req.body.message)
        if (req.body.message === '') {
            new DiscordMessageJob().perform('log', `**${byUsername}** cleared the shout`)
        } else {
            new DiscordMessageJob().perform('log', `**${byUsername}** shouted *"${req.body.message}"*`)
        }
        res.sendStatus(200)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.putTraining = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Training Scheduler')
        const listId = await trelloController.getIdFromListName(boardId, 'Scheduled')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        for (const card of cards) {
            if (parseInt(card.name) === req.params.trainingId) {
                const options = {}
                const trainingData = JSON.parse(card.desc)
                if (req.body.by) trainingData.by = req.body.by
                if (req.body.type) trainingData.type = req.body.type
                if (req.body.date) trainingData.date = req.body.date
                if (req.body.specialnotes) trainingData.specialnotes = req.body.specialnotes
                if (req.body.cancelled) {
                    trainingData.cancelled = {
                        by: req.body.by,
                        reason: req.body.reason,
                        at: timeHelper.getUnix()
                    }
                    options.idList = await trelloController.getIdFromListName(boardId, 'Cancelled')
                }
                if (req.body.finished) {
                    trainingData.finished = {
                        by: req.body.by,
                        at: timeHelper.getUnix()
                    }
                    options.idList = await trelloController.getIdFromListName(boardId, 'Finished')
                }
                options.desc = JSON.stringify(trainingData)
                return res.json(await trelloController.putCard(card.id, options))
            }
        }
        res.json(null)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.putSuspension = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Current')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        for (const card of cards) {
            if (parseInt(card.name) === req.params.userId) {
                const options = {}
                const suspensionData = JSON.parse(card.desc)
                if (req.body.by) suspensionData.by = req.body.by
                if (req.body.reason) suspensionData.reason = req.body.reason
                if (req.body.rankback) suspensionData.rankback = req.body.rankback
                if (req.body.cancelled) {
                    suspensionData.cancelled = {
                        by: req.body.by,
                        reason: req.body.reason,
                        at: timeHelper.getUnix()
                    }
                    options.idList = await trelloController.getIdFromListName(boardId, 'Done')
                }
                if (req.body.extended) {
                    let days = suspensionData.duration / 86400
                    if (!suspensionData.extended) suspensionData.extended = []
                    suspensionData.extended.forEach(extension => {
                        days += extension.duration / 86400
                    })
                    days += req.body.duration
                    if (days < 1) return next(createError(403, 'Insufficient amount of days'))
                    if (days > 7) return next(createError(403, 'Too many days'))
                    suspensionData.extended.push({
                        by: req.body.by,
                        duration: req.body.duration * 86400,
                        reason: req.body.reason,
                        at: timeHelper.getUnix()
                    })
                }
                options.desc = JSON.stringify(suspensionData)
                return res.json(await trelloController.putCard(card.id, options))
            }
        }
        res.json(null)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getGroup = async (req, res, next) => {
    try {
        res.json((await axios({
            method: 'get',
            url: `https://groups.roblox.com/v1/groups/${req.params.groupId}`,
        })).data)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
