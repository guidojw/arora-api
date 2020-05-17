'use strict'
const authService = require('./auth')
const banService = require('./ban')
const catalogService = require('./catalog')
const groupService = require('./group')
const trelloService = require('./trello')
const userService = require('./user')

module.exports = {
    authService,
    banService,
    catalogService,
    groupService,
    trelloService,
    userService
}
