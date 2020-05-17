'use strict'
const banController = require('./ban')
const catalogController = require('./catalog')
const groupController = require('./group')
const trelloController = require('./trello')
const userController = require('./user')

module.exports = {
    banController,
    catalogController,
    groupController,
    trelloController,
    userController
}
