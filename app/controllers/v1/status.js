'use strict'
const { body } = require('express-validator')
const roblox = require('noblox.js')

exports.validate = method => {
    switch (method) {
        case 'getStatus':
            return [
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}
exports.getStatus = async (req, res) => {
    await roblox.getCurrentUser()
    res.json(true)
}
