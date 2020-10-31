'use strict'
require('dotenv').config()

const express = require('express')
require('express-async-errors')
const logger = require('morgan')
const Sentry = require('@sentry/node')
const helmet = require('helmet')
const hpp = require('hpp')
const { ContainerBuilder, YamlFileLoader } = require('node-dependency-injection')

const { NotFoundError } = require('./app/errors')

const container = new ContainerBuilder(true, __dirname)
const loader = new YamlFileLoader(container)
loader.load('./config/application.yml')

const { sendError } = container.get('ErrorMiddleware')

const app = express()
app.set('container', container)

if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })
    app.use(Sentry.Handlers.requestHandler())
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(hpp())

app.use('/api/v1/groups', container.get('GroupsRouter'))
app.use('/api/v1/users', container.get('UsersRouter'))
app.use('/api/v1/bans', container.get('BansRouter'))
app.use('/api/v1/catalog', container.get('CatalogRouter'))
app.use('/api/v1/trello', container.get('TrelloRouter'))
app.use('/api/v1/status', container.get('StatusRouter'))

app.use(() => {
    throw new NotFoundError()
})

if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler())
}

app.use((err, req, res, _next) => {
    sendError(res, err.statusCode || 500, err.message)
})

module.exports = app
