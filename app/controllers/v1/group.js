'use strict'
const { param, body, header, query } = require('express-validator')
const { decodeScopeQueryParam, decodeSortQueryParam } = require('../../helpers/request')
const timeHelper = require('../../helpers/time')
const groupService = require('../../services/group')
const userService = require('../../services/user')
const announceTrainingsJob = require('../../jobs/announce-trainings')
const discordMessageJob = require('../../jobs/discord-message')
const cron = require('node-schedule')

const robloxConfig = require('../../../config/roblox')

function validate(method) {
    switch (method) {
        case 'suspend':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                body('userId').exists().isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('reason').exists().isString(),
                body('duration').exists().isInt().toInt(),
                body('rankBack').exists().isBoolean().toBoolean()
            ]
        case 'getShout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt()
            ]
        case 'getSuspensions':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                query('scope').customSanitizer(decodeScopeQueryParam),
                query('sort').customSanitizer(decodeSortQueryParam)
            ]
        case 'getTrainings':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                query('scope').customSanitizer(decodeScopeQueryParam),
                query('sort').customSanitizer(decodeSortQueryParam)
            ]
        case 'postTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('type').exists().isString(),
                body('date').exists(),
                body('notes').optional().isString()
            ]
        case 'getExiles':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt()
            ]
        case 'getSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt(),
                query('scope').customSanitizer(decodeScopeQueryParam)
            ]
        case 'getTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('trainingId').isInt().toInt(),
                query('scope').customSanitizer(decodeScopeQueryParam)
            ]
        case 'shout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('message').exists().isString()
            ]
        case 'putTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('trainingId').isInt().toInt(),
                body('editorId').exists().isInt().toInt(),
                body('changes.type').optional().isString(),
                body('changes.date').optional().isInt().toInt(),
                body('changes.notes').optional().isString(),
                body('changes.authorId').optional().isInt().toInt()
            ]
        case 'putSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt(),
                body('editorId').exists().isInt().toInt(),
                body('changes.authorId').optional().isInt().toInt(),
                body('changes.reason').optional().isString(),
                body('changes.rankBack').optional().isBoolean().toBoolean()
            ]
        case 'getGroup':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt()
            ]
        case 'cancelSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('reason').exists().isString()
            ]
        case 'cancelTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('trainingId').isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('reason').exists().isString()
            ]
        case 'extendSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('duration').exists().isInt().toInt(),
                body('reason').exists().isString()
            ]
        case 'putUser':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt(),
                body('rank').exists().isInt().toInt(),
                body('authorId').optional().isInt().toInt()
            ]
    }
}

async function suspend(req, res) {
    res.json((await groupService.suspend(req.params.groupId, req.body.userId, req.body)).get({ raw: true }))
}

async function getShout(req, res) {
    res.json(await groupService.getShout(req.params.groupId))
}

async function getSuspensions(req, res) {
    res.json((await groupService.getSuspensions(req.query.scope, req.query.sort)).map(suspension => {
        return suspension.get({ raw: true })
    }))
}

async function getTrainings(req, res) {
    res.json((await groupService.getTrainings(req.query.scope, req.query.sort)).map(training => {
        return training.get({ raw: true })
    }))
}

async function postTraining(req, res) {
    const training = await groupService.postTraining(req.body)

    announceTrainingsJob.run(robloxConfig.defaultGroup)
    cron.scheduleJob(`training_${training.id}`, new Date(training.date.getTime() + 30 * 60 * 1000),
        announceTrainingsJob.run.bind(null, robloxConfig.defaultGroup))

    const dateString = timeHelper.getDate(training.date)
    const timeString = timeHelper.getTime(training.date)
    const authorName = await userService.getUsername(training.authorId)
    discordMessageJob.run('log', `**${authorName}** scheduled a **${training.type.toUpperCase()}** ` +
        `training at **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**` +
        `${training.notes ? ' with note "*' + training.notes + '*"' : ''}`)

    res.json(training.get({ raw: true }))
}

async function getExiles(req, res) {
    res.json((await groupService.getExiles()).map(exile => exile.get({ raw: true })))
}

async function getSuspension(req, res) {
    res.json((await groupService.getSuspension(req.params.userId, req.query.scope)).get({ raw: true }))
}

async function getTraining(req, res) {
    res.json((await groupService.getTraining(req.params.trainingId, req.query.scope)).get({ raw: true }))
}

async function shout(req, res) {
    res.json(await groupService.shout(req.params.groupId, req.body.message, req.body.authorId))
}

async function putTraining(req, res) {
    const training = await groupService.putTraining(req.params.groupId, req.params.trainingId, req.body.changes)

    const editorName = await userService.getUsername(req.body.editorId)
    if (req.body.authorId) {
        const authorName = await userService.getUsername(training.authorId)
        discordMessageJob.run('log', `**${editorName}** changed training **${training.id}**'s host to ` +
            `**${authorName}**`)
    }
    if (req.body.notes) {
        discordMessageJob.run('log', `**${editorName}** changed training **${training.id}**'s notes to` +
            ` "*${training.notes}*"`)
    }
    if (req.body.type) {
        discordMessageJob.run('log', `**${editorName}** changed training **${training.id}**'s type to ` +
            `**${training.type.toUpperCase()}**`)
    }
    if (req.body.date) {
        const dateString = timeHelper.getDate(training.date)
        const timeString = timeHelper.getTime(training.date)
        discordMessageJob.run('log', `**${editorName}** changed training **${training.id}**'s date to ` +
            `**${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**`)
    }

    if (!req.body.notes) {
        announceTrainingsJob.run(robloxConfig.defaultGroup)
        const job = cron.scheduledJobs[`training_${training.id}`]
        if (job) job.cancel()
        cron.scheduleJob(`training_${training.id}`, training.date, announceTrainingsJob.run.bind(null,
            robloxConfig.defaultGroup))
    }

    res.json(training.get({ raw: true }))
}

async function putSuspension(req, res) {
    res.json((await groupService.putSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

async function getGroup(req, res) {
    res.json(await groupService.getGroup(req.params.groupId))
}

async function cancelSuspension(req, res) {
    res.json((await groupService.cancelSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

async function cancelTraining(req, res) {
    const cancellation = await groupService.cancelTraining(req.params.groupId, req.params.trainingId, req.body)

    announceTrainingsJob.run(robloxConfig.defaultGroup)
    const job = cron.scheduledJobs[`training_${cancellation.trainingId}`]
    if (job) job.cancel()

    const authorName = await userService.getUsername(cancellation.authorId)
    discordMessageJob.run('log', `**${authorName}** cancelled training **${cancellation.trainingId}** ` +
        `with reason "*${cancellation.reason}*"`)

    res.json(cancellation.get({ raw: true }))
}

async function extendSuspension(req, res) {
    res.json((await groupService.extendSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

async function putUser(req, res) {
    res.json(await groupService.changeRank(req.params.groupId, req.params.userId, req.body))
}

module.exports = {
    validate,
    suspend,
    getShout,
    getSuspensions,
    getTrainings,
    postTraining,
    getExiles,
    getSuspension,
    getTraining,
    shout,
    putTraining,
    putSuspension,
    getGroup,
    cancelSuspension,
    cancelTraining,
    extendSuspension,
    putUser
}
