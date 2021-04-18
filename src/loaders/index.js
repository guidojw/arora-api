'use strict'

const Sentry = require('@sentry/node')
const expressLoader = require('./express')
const containerLoader = require('./container')
const cronLoader = require('./cron')

const cronConfig = require('../../config/cron')

async function init (app) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH
    })
  }

  const container = containerLoader()
  app.set('container', container)

  await container.get('RobloxManager').init()
  container.get('WebSocketManager').init()

  expressLoader(app, container)
  cronLoader(container)

  if (cronConfig.announceTrainingsJob) {
    await container.get('AnnounceTrainingsJob').run()
  }
}

module.exports = {
  init
}
