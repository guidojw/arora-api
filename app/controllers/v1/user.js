'use strict'
const { param, header } = require('express-validator')

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
    }
}

exports.getUserId = async (req, res) => {
    res.json(await userService.getUserId(req.params.username))
}

exports.getJoinDate = async (req, res) => {
    res.json(await userService.getJoinDate(req.params.userId))
}