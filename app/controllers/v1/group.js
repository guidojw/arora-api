'use strict'
const { param, body, header, oneOf } = require('express-validator')

const groupService = require('../../services/group')

exports.validate = method => {
    switch (method) {
        case 'suspend':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                body('userId').exists().isNumeric(),
                body('authorId').exists().isNumeric(),
                body('reason').exists().isString(),
                body('duration').exists().isNumeric(),
                body('rankback').exists().isNumeric()
            ]
        case 'promote':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('authorId').optional().isNumeric()
            ]
        case 'getShout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'getSuspensions':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'getTrainings':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'scheduleTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                body('authorId').exists().isString(),
                body('type').exists().isString(),
                body('date').exists().isNumeric(),
                body('notes').optional().isString()
            ]
        case 'getExiles':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'getSuspension':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
        case 'getTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('trainingId').isNumeric()
            ]
        case 'shout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                body('authorId').exists().isNumeric(),
                body('message').exists().isString()
            ]
        case 'putTraining': // This is ugly because epxress-validator doesn't support nested oneOfs
            return oneOf([
                [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('type').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('date').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('notes').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('authorId').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean(),
                ]
            ])
            /*return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('trainingId').isNumeric(),
                body('editorId').exists().isNumeric(),
                oneOf([
                    body('type').exists().isString(),
                    body('date').exists().isNumeric(),
                    body('notes').exists().isString(),
                    body('authorId').exists().isNumeric()
                    [
                        body('cancelled').exists().isBoolean(),
                        body('reason').exists().isBoolean()
                    ]
                ])
            ]*/
        case 'putSuspension':
            return oneOf([
                [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('authorId').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('reason').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('rankBack').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('extended').exists().isBoolean(),
                    body('duration').exists().isNumeric(),
                    body('reason').exists().isString()
                ]
            ])
            /*return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('editorId').exists().isNumeric(),
                oneOf([
                    body('authorId').exists().isNumeric(),
                    body('reason').exists().isString(),
                    body('rankBack').exists().isNumeric(),
                    [
                        body('cancelled').exists().isBoolean(),
                        body('reason').exists().isBoolean()
                    ], [
                        body('extended').exists().isBoolean(),
                        body('duration').exists().isNumeric(),
                        body('reason').exists().isString()
                    ]
                ])
            ]*/
        case 'getGroup':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'getFinishedSuspensions':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'announceTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('trainingId').isNumeric(),
                body('authorId').exists().isNumeric(),
                body('medium').optional().isString()
            ]
    }
}

exports.suspend = async (req, res) => {
    res.json(await groupService.suspend(req.params.groupId, req.body.userId, {
        authorId: req.body.authorId,
        reason: req.body.reason,
        duration: req.body.duration,
        rankBack: req.body.rankBack
    }))
}

exports.promote = async (req, res) => {
    res.json(await groupService.promote(req.params.groupId, req.params.userId, req.body.authorId))
}

exports.getShout = async (req, res) => {
    res.json(await groupService.getShout(req.params.groupId))
}

exports.getSuspensions = async (req, res) => {
    res.json(await groupService.getSuspensions())
}

exports.getTrainings = async (req, res) => {
    res.json(await groupService.getTrainings())
}

exports.scheduleTraining = async (req, res) => {
    res.json(await groupService.scheduleTraining({
        author: req.body.authorId,
        type: req.body.type,
        date: req.body.date,
        notes: req.body.notes
    }))
}

exports.getExiles = async (req, res) => {
    res.json(await groupService.getExiles())
}

exports.getSuspension = async (req, res) => {
    res.json(await groupService.getSuspension(req.params.userId))
}

exports.getTraining = async (req, res) => {
    res.json(await groupService.getTraining(req.params.trainingId))
}

exports.shout = async (req, res) => {
    res.json(await groupService.shout(req.params.groupId, req.body.authorId, req.body.message))
}

exports.putTraining = async (req, res) => {
    res.json(await groupService.putTraining(req.params.groupId, req.params.trainingId, {
        authorId: req.body.authorId,
        type: req.body.type,
        date: req.body.date,
        notes: req.body.notes,
        cancelled: req.body.cancelled,
        reason: req.body.reason,
        finished: req.body.finished,
        editorId: req.body.editorId
    }))
}

exports.putSuspension = async (req, res) => {
    res.json(await groupService.putSuspension(req.params.groupId, req.params.userId, {
        authorId: req.body.authorId,
        reason: req.body.reason,
        rankBack: req.body.rankBack,
        cancelled: req.body.cancelled,
        extended: req.body.extended,
        duration: req.body.duration,
        editorId: req.body.editorId
    }))
}

exports.getGroup = async (req, res) => {
    res.json(await groupService.getGroup(req.params.groupId))
}

exports.getFinishedSuspensions = async (req, res) => {
    res.json(await groupService.getFinishedSuspensions())
}

exports.announceTraining = async (req, res) => {
    res.json(await groupService.announceTraining(req.params.groupId, req.params.trainingId, {
        medium: req.body.medium,
        authorId: req.body.authorId
    }))
}
