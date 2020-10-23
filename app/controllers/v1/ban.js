'use strict'
const { param, body, header, query } = require('express-validator')
const banService = require('../../services/ban')
const { decodeScopeQueryParam, decodeSortQueryParam } = require('../../helpers/request')

function validate(method) {
    switch (method) {
        case 'getBans':
            return [
                header('authorization').exists().isString(),
                query('scope').customSanitizer(decodeScopeQueryParam),
                query('sort').customSanitizer(decodeSortQueryParam)
            ]
        case 'ban':
            return [
                header('authorization').exists().isString(),
                body('userId').exists().isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('reason').exists().isString(),
                body('groupId').exists().isInt().toInt()
            ]
        case 'putBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isInt().toInt(),
                body('editorId').exists().isInt().toInt(),
                body('changes.authorId').optional().isInt().toInt(),
                body('changes.reason').optional().isString()
            ]
        case 'getBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isInt().toInt(),
                query('scope').customSanitizer(decodeScopeQueryParam)
            ]
        case 'cancelBan':
            return [
                header('authorization').exists().isString(),
                param('userId').exists().isInt().toInt(),
                body('authorId').exists().isInt().toInt(),
                body('reason').exists().isString()
            ]
    }
}

async function getBans(req, res) {
    res.json((await banService.getBans(req.query.scope, req.query.sort)).map(ban => ban.get({ raw: true })))
}

async function ban(req, res) {
    res.json((await banService.ban(req.body.groupId, req.body.userId, req.body)).get({ raw: true }))
}

async function putBan(req, res) {
    res.json((await banService.putBan(req.params.userId, req.body)).get({ raw: true }))
}

async function getBan(req, res) {
    res.json((await banService.getBan(req.params.userId, req.query.scope)).get({ raw: true }))
}

async function cancelBan(req, res) {
    res.json((await banService.cancelBan(req.params.userId, req.body.authorId, req.body.reason)).get({ raw: true }))
}

module.exports = {
    validate,
    getBans,
    ban,
    putBan,
    getBan,
    cancelBan
}
