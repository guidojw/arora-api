'use strict'
const { param, header, body } = require('express-validator')

class UserController {
    constructor(userService) {
        this._userService = userService
    }

    async getUserIdFromUsername(req, res) {
        res.json(await this._userService.getUserIdFromUsername(req.params.username))
    }

    async hasBadge(req, res) {
        res.json(await this._userService.hasBadge(req.params.userId, req.params.badgeId))
    }

    async getUsers(req, res) {
        res.json(await this._userService.getUsers(req.body.userIds))
    }

    async getRank(req, res) {
        res.json(await this._userService.getRank(req.params.userId, req.params.groupId))
    }

    async getRole(req, res) {
        res.json(await this._userService.getRole(req.params.userId, req.params.groupId))
    }

    async getUser(req, res) {
        res.json(await this._userService.getUser(req.params.userId))
    }

    validate(method) {
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
}

module.exports = UserController
