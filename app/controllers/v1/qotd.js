'use strict'
const { body } = require('express-validator')

const qotdService = require('../../services/qotd')

exports.validate = method => {
    switch (method) {
        case 'suggest':
            return [
                body('id').exists().isNumeric(),
                body('key').exists().isString(),
                body('qotd').exists().isString(),
                body('by').exists().isString()
            ]
    }
}

exports.suggest = async (req, res) => {
    await qotdService.suggest(req.body.qotd, req.body.by)
    res.sendStatus(200)
}
