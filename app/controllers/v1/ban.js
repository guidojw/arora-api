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
                header('authorization').exists().isString(),
                param('userId').exists().isNumeric(),
                body('by').exists().isNumeric(),
                body('unbanned').exists().isBoolean()
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
    await banService.ban(req.body.groupId, req.body.userId, req.body.by, req.body.reason)
    res.sendStatus(200)
}

exports.putBan = async (req, res) => {
    await banService.putBan(req.params.userId, {
        unbanned: req.body.unbanned,
        by: req.body.by
    })
    res.sendStatus(200)
}

exports.getBan = async (req, res) => {
    res.json(await banService.getBan(req.params.userId))
}
