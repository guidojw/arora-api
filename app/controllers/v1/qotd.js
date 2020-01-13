'use strict'
const { body, header } = require('express-validator')

const qotdService = require('../../services/qotd')

exports.validate = method => {
    switch (method) {
        case 'suggest':
            return [
                header('authorization').exists().isString(),
                body('qotd').exists().isString(),
                body('by').exists().isString()
            ]
    }
}

exports.suggest = async (req, res) => {
    await qotdService.suggest(req.body.qotd, req.body.by)
    res.sendStatus(200)
}
