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
                body('authorId').exists().isNumeric(),
                body('reason').exists().isString(),
                body('groupId').exists().isNumeric()
            ]
        case 'putBan':
            return oneOf([
                [
                    header('authorization').exists().isString(),
                    param('userId').exists().isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('authorId').exists().isNumeric()
                ], [
                    header('authorization').exists().isString(),
                    param('userId').exists().isNumeric(),
                    body('editorId').exists().isNumeric(),
                    body('reason').exists().isString()
                ]
            ])
        case 'getBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isNumeric()
            ]
        case 'cancelBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isNumeric(),
                body('authorId').exists().isNumeric(),
                body('reason').exists().isString()
            ]
    }
}

exports.getBans = async (req, res) => {
    res.json(await banService.getBans())
}

exports.ban = async (req, res) => {
    res.json(await banService.ban(req.body.groupId, req.body.userId, req.body.authorId, req.body.reason))
}

exports.putBan = async (req, res) => {
    res.json(await banService.putBan(req.params.userId, {
        editorId: req.body.editorId,
        changes: {
            unbanned: req.body.unbanned,
            authorId: req.body.authorId,
            reason: req.body.reason
        }
    }))
}

exports.getBan = async (req, res) => {
    res.json(await banService.getBan(req.params.userId))
}

exports.cancelBan = async (req, res) => {
    res.json(await banService.cancelBan(req.params.userId, req.body.authorId, req.body.reason))
}
