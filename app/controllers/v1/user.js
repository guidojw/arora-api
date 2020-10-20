'use strict'
const { param, header, body } = require('express-validator')
const userService = require('../../services/user')

exports.validate = method => {
    switch (method) {
        case 'getUserIdFromUsername':
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

exports.getUserIdFromUsername = async (req, res) => {
    res.json(await userService.getUserIdFromUsername(req.params.username))
}

exports.hasBadge = async (req, res) => {
    res.json(await userService.hasBadge(req.params.userId, req.params.badgeId))
}

exports.getUsers = async (req, res) => {
    res.json(await userService.getUsers(req.body.userIds))
}

exports.getRank = async (req, res) => {
    res.json(await userService.getRank(req.params.userId, req.params.groupId))
}

exports.getRole = async (req, res) => {
    res.json(await userService.getRole(req.params.userId, req.params.groupId))
}

exports.getUser = async (req, res) => {
    res.json(await userService.getUser(req.params.userId))
}
