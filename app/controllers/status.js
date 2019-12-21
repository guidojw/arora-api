'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')

exports.validate = method => {
    switch (method) {
        case 'getStatus':
            return [
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}
exports.getStatus = async (req, res, next) => {
    try {
        await roblox.getCurrentUser()
        res.json(true)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
