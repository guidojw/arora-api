'use strict'
require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const { sendError } = require('./app/helpers/error')
//const { authenticate } = require('./app/controllers/auth')

const groupsRouter = require('./routes/groups')
const usersRouter = require('./routes/users')
const bansRouter = require('./routes/bans')
const statusRouter = require('./routes/status')
const qotdsRouter = require('./routes/qotds')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
//app.use(authenticate)

app.use('/v1/groups', groupsRouter)
app.use('/v1/users', usersRouter)
app.use('/v1/bans', bansRouter)
app.use('/v1/status', statusRouter)
app.use('/v1/qotds', qotdsRouter)

app.use((req, res, next) => {
    next(createError(404))
})

app.use((err, req, res, next) => {
    sendError(res, err.status || 500, err.message)
})

module.exports = app
