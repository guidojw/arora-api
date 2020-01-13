'use strict'
require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const { sendError } = require('./app/middlewares/error')

const groupsRouter = require('./app/routes/groups')
const usersRouter = require('./app/routes/users')
const bansRouter = require('./app/routes/bans')
const statusRouter = require('./app/routes/status')
const qotdsRouter = require('./app/routes/qotds')

const app = express()
require('express-async-errors')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/v1/groups', groupsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/bans', bansRouter)
app.use('/api/v1/status', statusRouter)
app.use('/api/v1/qotds', qotdsRouter)

app.use(() => {
    throw createError(404)
})

app.use((err, req, res, next) => {
    sendError(res, err.status || 500, err.message)
})

module.exports = app
