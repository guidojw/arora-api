'use strict'
const { param, body, header, oneOf } = require('express-validator')
const groupService = require('../../services/group')

exports.validate = method => {
    switch (method) {
        case 'suspend':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                body('userId').exists().isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('reason').exists().isString(),
                body('duration').exists().isNumeric().toInt(),
                body('rankBack').exists().isBoolean().toBoolean()
            ]
        case 'getShout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'getSuspensions':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'getTrainings':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'postTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('type').exists().isString(),
                body('date').exists().toDate(),
                body('notes').optional().isString()
            ]
        case 'getExiles':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'getSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('userId').isNumeric().toInt()
            ]
        case 'getTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('trainingId').isNumeric().toInt()
            ]
        case 'shout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('message').exists().isString()
            ]
        case 'putTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('trainingId').isNumeric().toInt(),
                body('editorId').exists().isNumeric().toInt(),
                oneOf([
                    body('changes.type').exists().isString(),
                    body('changes.date').exists().isNumeric().toInt(),
                    body('changes.notes').exists().isString(),
                    body('changes.authorId').exists().isNumeric().toInt()
                ])
            ]
        case 'putSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('userId').isNumeric().toInt(),
                body('editorId').exists().isNumeric().toInt(),
                oneOf([
                    body('changes.authorId').exists().isNumeric().toInt(),
                    body('changes.reason').exists().isString(),
                    body('changes.rankBack').exists().isBoolean().toBoolean()
                ])
            ]
        case 'getGroup':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'getFinishedSuspensions':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt()
            ]
        case 'announceTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('trainingId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('medium').optional().isString()
            ]
        case 'cancelSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('userId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('reason').exists().isString()
            ]
        case 'cancelTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('trainingId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('reason').exists().isString()
            ]
        case 'extendSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('userId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('duration').exists().isNumeric().toInt(),
                body('reason').exists().isString()
            ]
        case 'putUser':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('userId').isNumeric().toInt(),
                body('rank').exists().isNumeric().toInt(),
                body('authorId').optional().isNumeric().toInt()
            ]
    }
}

exports.suspend = async (req, res) => {
    res.json((await groupService.suspend(req.params.groupId, req.body.userId, {
        authorId: req.body.authorId,
        reason: req.body.reason,
        duration: req.body.duration,
        rankBack: req.body.rankBack
    })).get({ raw: true }))
}

exports.getShout = async (req, res) => {
    res.json(await groupService.getShout(req.params.groupId))
}

exports.getSuspensions = async (req, res) => {
    res.json((await groupService.getSuspensions()).map(suspension => suspension.get({ raw: true })))
}

exports.getTrainings = async (req, res) => {
    res.json((await groupService.getTrainings()).map(training => training.get({ raw: true })))
}

exports.postTraining = async (req, res) => {
    res.json((await groupService.postTraining({
        authorId: req.body.authorId,
        type: req.body.type,
        date: req.body.date,
        notes: req.body.notes
    })).get({ raw: true }))
}

exports.getExiles = async (req, res) => {
    res.json((await groupService.getExiles()).map(exile => exile.get({ raw: true })))
}

exports.getSuspension = async (req, res) => {
    res.json((await groupService.getSuspension(req.params.userId)).get({ raw: true }))
}

exports.getTraining = async (req, res) => {
    res.json((await groupService.getTraining(req.params.trainingId)).get({ raw: true }))
}

exports.shout = async (req, res) => {
    res.json(await groupService.shout(req.params.groupId, req.body.authorId, req.body.message))
}

exports.putTraining = async (req, res) => {
    res.json((await groupService.putTraining(req.params.groupId, req.params.trainingId, {
        editorId: req.body.editorId,
        changes: req.body.changes
    })).get({ raw: true }))
}

exports.putSuspension = async (req, res) => {
    res.json((await groupService.putSuspension(req.params.groupId, req.params.userId, {
        editorId: req.body.editorId,
        changes: req.body.changes
    })).get({ raw: true }))
}

exports.getGroup = async (req, res) => {
    res.json(await groupService.getGroup(req.params.groupId))
}

exports.getFinishedSuspensions = async (req, res) => {
    res.json((await groupService.getFinishedSuspensions()).map(suspension => suspension.get({ raw: true })))
}

exports.announceTraining = async (req, res) => {
    res.json(await groupService.announceTraining(req.params.groupId, req.params.trainingId, {
        medium: req.body.medium,
        authorId: req.body.authorId
    }))
}

exports.cancelSuspension = async (req, res) => {
    res.json((await groupService.cancelSuspension(req.params.groupId, req.params.userId, {
        authorId: req.body.authorId,
        reason: req.body.reason
    })).get({ raw: true }))
}

exports.cancelTraining = async (req, res) => {
    res.json((await groupService.cancelTraining(req.params.groupId, req.params.trainingId, {
        authorId: req.body.authorId,
        reason: req.body.reason
    })).get({ raw: true }))
}

exports.extendSuspension = async (req, res) => {
    res.json((await groupService.extendSuspension(req.params.groupId, req.params.userId, {
        authorId: req.body.authorId,
        duration: req.body.duration,
        reason: req.body.reason
    })).get({ raw: true }))
}

exports.putUser = async (req, res) => {
    res.json(await groupService.changeRank(req.params.groupId, req.params.userId, {
        rank: req.body.rank,
        authorId: req.body.authorId
    }))
}
