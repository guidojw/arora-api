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
                body('by').exists().isNumeric(),
                body('reason').exists().isString(),
                body('duration').exists().isNumeric(),
                body('rankback').exists().isNumeric()
            ]
        case 'getRank':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
        case 'promote':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('by').optional().isNumeric()
            ]
        case 'getShout':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
        case 'getRole':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric()
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
        case 'hostTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                body('by').exists().isString(),
                body('type').exists().isString(),
                body('date').exists().isNumeric(),
                body('specialnotes').optional().isString()
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
                body('by').exists().isNumeric(),
                body('message').exists().isString()
            ]
        case 'putTraining': // This is ugly because epxress-validator doesn't support nested oneOfs
            return oneOf([
                [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('type').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('date').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('specialnotes').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('by').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean(),
                    body('by').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('trainingId').isNumeric(),
                    body('finished').exists().isBoolean(),
                    body('by').exists().isString()
                ]
            ])
            /*return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('trainingId').isNumeric(),
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
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('by').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('reason').exists().isString()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('rankback').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('cancelled').exists().isBoolean(),
                    body('reason').exists().isBoolean(),
                    body('by').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('groupId').isNumeric(),
                    param('userId').isNumeric(),
                    body('extended').exists().isBoolean(),
                    body('duration').exists().isNumeric(),
                    body('reason').exists().isString(),
                    body('by').exists().isNumeric()
                ]
            ])
            /*return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
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
                header('authorization').exists().isString(),
                param('groupId').isNumeric()
            ]
    }
}

exports.suspend = async (req, res) => {
    await groupService.suspend(req.params.groupId, req.params.userId, {
        by: req.body.by,
        reason: req.body.reason,
        duration: req.body.duration,
        rankback: req.body.rankback
    })
    res.sendStatus(200)
}

exports.getRank = async (req, res) => {
    res.json(await groupService.getRank(req.params.groupId, req.params.userId))
}

exports.promote = async (req, res) => {
    res.send(await groupService.promote(req.params.groupId, req.params.userId, req.body.by))
}

exports.getShout = async (req, res) => {
    res.json(await groupService.getShout(req.params.groupId))
}

exports.getRole = async (req, res) => {
    res.json(await groupService.getRankNameInGroup(req.params.groupId, req.params.userId))
}

exports.getSuspensions = async (req, res) => {
    res.json(await groupService.getSuspensions())
}

exports.getTrainings = async (req, res) => {
    res.json(await groupService.getTrainings())
}

exports.hostTraining = async (req, res) => {
    res.json(await groupService.hostTraining({
        by: req.body.by,
        type: req.body.type,
        date: req.body.date,
        specialnotes: req.body.specialnotes
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
    await groupService.shout(req.params.groupId, req.body.by, req.body.message)
    res.sendStatus(200)
}

exports.putTraining = async (req, res) => {
    res.json(await groupService.putTraining(req.params.trainingId, {
        by: req.body.by,
        type: req.body.type,
        date: req.body.date,
        specialnotes: req.body.specialnotes,
        cancelled: req.body.cancelled,
        reason: req.body.reason,
        finished: req.body.finished
    }))
}

exports.putSuspension = async (req, res) => {
    res.json(await groupService.putSuspension(req.params.userId, {
        by: req.body.by,
        reason: req.body.reason,
        rankback: req.body.rankback,
        cancelled: req.body.cancelled,
        extended: req.body.extended,
        duration: req.body.duration
    }))
}

exports.getGroup = async (req, res) => {
    res.json(await groupService.getGroup(req.params.groupId))
}
