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
require('express-async-errors')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
//app.use(authenticate)

app.use('/api/v1/groups', groupsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/bans', bansRouter)
app.use('/api/v1/status', statusRouter)
app.use('/api/v1/qotds', qotdsRouter)

app.use(() => {
    throw createError(404)
})

app.use((err, req, res) => {
    sendError(res, err.status || 500, err.message)
})

module.exports = app
