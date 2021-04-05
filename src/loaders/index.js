'use strict'

const Sentry = require('@sentry/node')
const expressLoader = require('./express')
const containerLoader = require('./container')
const cronLoader = require('./cron')

async function init (app) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })
  }

  const container = containerLoader()
  app.set('container', container)

  await container.get('RobloxManager').init()
  container.get('WebSocketManager').init()

  expressLoader(app, container)
  cronLoader(container)

  await Promise.all([
    container.get('CheckSuspensionsJob').run(),
    container.get('AnnounceTrainingsJob').run()
  ])
}

module.exports = {
  init
}
