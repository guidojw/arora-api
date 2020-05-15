'use strict'
const { param, header, body } = require('express-validator')
const userService = require('../../services/user')

exports.validate = method => {
    switch (method) {
        case 'getUserId':
            return [
                header('authorization').exists().isString(),
                param('username').isString()
            ]
        case 'hasBadge':
            return [
                header('authorization').exists().isString(),
                param('userId').isNumeric(),
                param('badgeId').isNumeric()
            ]
        case 'getUsers':
            return [
                header('authorization').exists().isString(),
                body('userIds').exists()
            ]
        case 'getRank':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
        case 'getRole':
            return [
                header('authorization').exists().isString(),
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
        case 'getUser':
            return [
                header('authorization').exists().isString(),
                param('userId').isNumeric()
            ]
    }
}

exports.getUserId = async (req, res) => {
    res.json(await userService.getUserId(req.params.username))
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
