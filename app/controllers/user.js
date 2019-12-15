'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')

exports.validate = method => {
    switch (method) {
        case 'getUserId':
            return [
                param('username').isString()
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}
exports.getUserId = async (req, res, next) => {
    try {
        const userId = await roblox.getIdFromUsername(req.params.username)
        res.json(userId)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}