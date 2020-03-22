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
        case 'getJoinDate':
            return [
                header('authorization').exists().isString(),
                param('userId').isNumeric()
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
                body('userIds').exists(),
                body('excludeBannedUsers').optional().isBoolean()
            ]
    }
}

exports.getUserId = async (req, res) => {
    res.json(await userService.getUserId(req.params.username))
}

exports.getJoinDate = async (req, res) => {
    res.json(await userService.getJoinDate(req.params.userId))
}

exports.hasBadge = async (req, res) => {
    res.json(await userService.hasBadge(req.params.userId, req.params.badgeId))
}

exports.getUsers = async (req, res) => {
    res.json(await userService.getUsers(req.body.userIds, req.body.excludeBannedUsers))
}
