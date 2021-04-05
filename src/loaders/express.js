'use strict'

const Sentry = require('@sentry/node')
const express = require('express')
const helmet = require('helmet')
const hpp = require('hpp')
const logger = require('morgan')

const { NotFoundError } = require('../errors')

function init (app, container) {
  const errorMiddleware = container.get('ErrorMiddleware')

  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.requestHandler())
  }

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(helmet())
  app.use(hpp())

  app.use('/v1/groups', container.get('GroupsRouter'))
  app.use('/v1/users', container.get('UsersRouter'))
  app.use('/v1/catalog', container.get('CatalogRouter'))
  app.use('/v1/status', container.get('StatusRouter'))

  app.use(() => {
    throw new NotFoundError()
  })

  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler())
  }

  app.use((err, req, res, _next) => {
    errorMiddleware.sendError(res, err.statusCode || 500, err.message)
  })
}

module.exports = init
