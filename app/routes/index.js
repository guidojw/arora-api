'use strict'
const bansRouter = require('./bans')
const catalogRouter = require('./catalog')
const groupsRouter = require('./groups')
const trelloRouter = require('./trello')
const usersRouter = require('./users')

module.exports = {
    bansRouter,
    catalogRouter,
    groupsRouter,
    trelloRouter,
    usersRouter
}
