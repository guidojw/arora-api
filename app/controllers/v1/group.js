'use strict'
const { param, body, header, oneOf, query } = require('express-validator')
const groupService = require('../../services/group')
const { decodeQuery } = require('../../helpers/request')

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
                param('groupId').isNumeric().toInt(),
                query('scope').customSanitizer(decodeQuery)
            ]
        case 'getTrainings':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                query('scope').customSanitizer(decodeQuery)
            ]
        case 'postTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                body('authorId').exists().isNumeric().toInt(),
                body('type').exists().isString(),
                body('date').exists(),
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
                param('userId').isNumeric().toInt(),
                query('scope').customSanitizer(decodeQuery)
            ]
        case 'getTraining':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric().toInt(),
                param('trainingId').isNumeric().toInt(),
                query('scope').customSanitizer(decodeQuery)
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
    res.json((await groupService.suspend(req.params.groupId, req.body.userId, req.body)).get({ raw: true }))
}

exports.getShout = async (req, res) => {
    res.json(await groupService.getShout(req.params.groupId))
}

exports.getSuspensions = async (req, res) => {
    res.json((await groupService.getSuspensions(req.query)).map(suspension => suspension.get({ raw: true })))
}

exports.getTrainings = async (req, res) => {
    res.json((await groupService.getTrainings(req.query)).map(training => training.get({ raw: true })))
}

exports.postTraining = async (req, res) => {
    res.json((await groupService.postTraining(req.body)).get({ raw: true }))
}

exports.getExiles = async (req, res) => {
    res.json((await groupService.getExiles()).map(exile => exile.get({ raw: true })))
}

exports.getSuspension = async (req, res) => {
    res.json((await groupService.getSuspension(req.params.userId, req.query)).get({ raw: true }))
}

exports.getTraining = async (req, res) => {
    res.json((await groupService.getTraining(req.params.trainingId, req.query)).get({ raw: true }))
}

exports.shout = async (req, res) => {
    res.json(await groupService.shout(req.params.groupId, req.body.authorId, req.body.message))
}

exports.putTraining = async (req, res) => {
    res.json((await groupService.putTraining(req.params.groupId, req.params.trainingId, req.body)).get({ raw: true }))
}

exports.putSuspension = async (req, res) => {
    res.json((await groupService.putSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

exports.getGroup = async (req, res) => {
    res.json(await groupService.getGroup(req.params.groupId))
}

exports.announceTraining = async (req, res) => {
    res.json(await groupService.announceTraining(req.params.groupId, req.params.trainingId, req.body))
}

exports.cancelSuspension = async (req, res) => {
    res.json((await groupService.cancelSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

exports.cancelTraining = async (req, res) => {
    res.json((await groupService.cancelTraining(req.params.groupId, req.params.trainingId, req.body)).get({
        raw: true }))
}

exports.extendSuspension = async (req, res) => {
    res.json((await groupService.extendSuspension(req.params.groupId, req.params.userId, req.body)).get({ raw: true }))
}

exports.putUser = async (req, res) => {
    res.json(await groupService.changeRank(req.params.groupId, req.params.userId, req.body))
}
