'use strict'
require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const Sentry = require('@sentry/node')
const { sendError } = require('./app/middlewares/error')
const helmet = require('helmet')
const hpp = require('hpp')

require('express-async-errors')

const groupsRouter = require('./app/routes/groups')
const usersRouter = require('./app/routes/users')
const bansRouter = require('./app/routes/bans')
const trelloRouter = require('./app/routes/trello')
const catalogRouter = require('./app/routes/catalog')

const app = express()

if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })
    app.use(Sentry.Handlers.requestHandler())
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(hpp())

app.use('/api/v1/groups', groupsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/bans', bansRouter)
app.use('/api/v1/catalog', catalogRouter)
app.use('/api/v1/trello', trelloRouter)

app.use(() => {
    throw createError(404)
})

if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler())
}

app.use((err, req, res, _next) => {
    sendError(res, err.status || 500, err.message)
})

module.exports = app
