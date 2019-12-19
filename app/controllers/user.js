'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')
const axios = require('axios')

exports.validate = method => {
    switch (method) {
        case 'getUserId':
            return [
                param('username').isString()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
        case 'getJoinDate':
            return [
                param('userId').isNumeric()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}
exports.getUserId = async (req, res, next) => {
    try {
        res.json(await roblox.getIdFromUsername(req.params.username))
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}

exports.getJoinDate = async (req, res, next) => {
    try {
        res.json((await axios({
            method: 'get',
            url: `https://users.roblox.com/v1/users/${req.params.userId}`,
        })).data.created)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}