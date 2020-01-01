'use strict'
const { body } = require('express-validator')

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

exports.suggest = async (req, res) => {
    const boardId = await trelloController.getIdFromBoardName('[NS] QOTD Board')
    const listId = await trelloController.getIdFromListName(boardId, 'Suggested')
    await trelloController.postCard({
        idList: listId,
        name: req.body.qotd,
        desc: req.body.by
    })
    res.sendStatus(200)
}
