'use strict'
const { param, header, body } = require('express-validator')
const userService = require('../../services/user')

function validate (method) {
    switch (method) {
        case 'getUserId':
            return [
                header('authorization').exists().isString(),
                param('username').isString()
            ]
        case 'hasBadge':
            return [
                header('authorization').exists().isString(),
                param('userId').isInt().toInt(),
                param('badgeId').isInt().toInt()
            ]
        case 'getUsers':
            return [
                header('authorization').exists().isString(),
                body('userIds').exists(),
                body('userIds.*').isInt().toInt()
            ]
        case 'getRank':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt()
            ]
        case 'getRole':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt(),
                param('userId').isInt().toInt()
            ]
        case 'getUser':
            return [
                header('authorization').exists().isString(),
                param('userId').isInt().toInt()
            ]
    }
}

async function getUserId (req, res) {
    res.json(await userService.getUserId(req.params.username))
}

async function hasBadge (req, res) {
    res.json(await userService.hasBadge(req.params.userId, req.params.badgeId))
}

async function getUsers (req, res) {
    res.json(await userService.getUsers(req.body.userIds))
}

async function getRank (req, res) {
    res.json(await userService.getRank(req.params.userId, req.params.groupId))
}

async function getRole (req, res) {
    res.json(await userService.getRole(req.params.userId, req.params.groupId))
}

async function getUser (req, res) {
    res.json(await userService.getUser(req.params.userId))
}

module.exports = {
    validate,
    getUserId,
    hasBadge,
    getUsers,
    getRank,
    getRole,
    getUser
}
