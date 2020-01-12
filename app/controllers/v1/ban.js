'use strict'
const { param, body, oneOf } = require('express-validator')

const banService = require('../../services/ban')

exports.validate = method => {
    switch (method) {
        case 'getBans':
            return []
        case 'ban':
            return [
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('userId').exists().isNumeric(),
                body('by').exists().isNumeric(),
                body('reason').exists().isString(),
                body('groupId').exists().isNumeric()
            ]
        case 'putBan':
            return oneOf([
                param('userId').exists().isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('by').exists().isNumeric(),
                body('unbanned').exists().isBoolean()
            ])
    }
}

exports.getBans = async (req, res) => {
    res.json(await banService.getBans())
}

exports.ban = async (req, res) => {
    await banService.ban(req.body.groupId, req.body.userId, req.body.by, req.body.reason)
    res.sendStatus(200)
}

exports.putBan = async (req, res) => {
    await banService.putBan(req.body.userId, {
        unbanned: req.body.unbanned,
        by: req.body.by
    })
    res.sendStatus(200)
}
