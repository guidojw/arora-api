'use strict'
const { param, body, header, oneOf } = require('express-validator')

const banService = require('../../services/ban')

exports.validate = method => {
    switch (method) {
        case 'getBans':
            return [
                header('authorization').exists().isString()
            ]
        case 'ban':
            return [
                header('authorization').exists().isString(),
                body('userId').exists().isNumeric(),
                body('by').exists().isNumeric(),
                body('reason').exists().isString(),
                body('groupId').exists().isNumeric()
            ]
        case 'putBan':
            return oneOf([
                [
                    header('authorization').exists().isString(),
                    param('userId').exists().isNumeric(),
                    body('byUserId').exists().isNumeric(),
                    body('unbanned').exists().isBoolean()
                ], [
                    header('authorization').exists().isString(),
                    param('userId').exists().isNumeric(),
                    body('byUserId').exists().isNumeric(),
                    body('by').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('userId').exists().isNumeric(),
                    body('byUserId').exists().isNumeric(),
                    body('reason').exists().isString()
                ]
            ])
        case 'getBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isNumeric()
            ]
    }
}

exports.getBans = async (req, res) => {
    res.json(await banService.getBans())
}

exports.ban = async (req, res) => {
    res.json(await banService.ban(req.body.groupId, req.body.userId, req.body.by, req.body.reason))
}

exports.putBan = async (req, res) => {
    res.json(await banService.putBan(req.params.userId, {
        unbanned: req.body.unbanned,
        by: req.body.by,
        reason: req.body.reason,
        byUserId: req.body.byUserId
    }))
}

exports.getBan = async (req, res) => {
    res.json(await banService.getBan(req.params.userId))
}
