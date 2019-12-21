'use strict'
const { body } = require('express-validator')
const createError = require('http-errors')

const trelloController = require('./trello')

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

exports.suggest = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] QOTD Board')
        const listId = await trelloController.getIdFromListName(boardId, 'Suggested')
        await trelloController.postCard({
            idList: listId,
            name: req.body.qotd,
            desc: req.body.by
        })
        res.sendStatus(200)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
