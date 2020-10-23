'use strict'
const { param, body, header, query } = require('express-validator')
const groupService = require('../../services/group')
const { decodeScopeQueryParam, decodeSortQueryParam } = require('../../helpers/request')

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
    res.json((await groupService.getSuspensions(req.query.scope, req.query.sort)).map(suspension => suspension.get({
        raw: true })))
}

async function getTrainings(req, res) {
    res.json((await groupService.getTrainings(req.query.scope, req.query.sort)).map(training => training.get({
        raw: true })))
}

async function postTraining(req, res) {
    res.json((await groupService.postTraining(req.body)).get({ raw: true }))
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
    res.json((await groupService.putTraining(req.params.groupId, req.params.trainingId, req.body)).get({ raw: true }))
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
    res.json((await groupService.cancelTraining(req.params.groupId, req.params.trainingId, req.body)).get({
        raw: true }))
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
