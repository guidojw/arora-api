import { Application } from 'express'
import Sentry from '@sentry/node'
import containerLoader from './container'
import cronConfig from '../configs/cron'
import cronLoader from './cron'
import expressLoader from './express'

export async function init (app: Application): Promise<void> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
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

  if (Object.prototype.hasOwnProperty.call(cronConfig, 'announceTrainingsJob')) {
    await container.get('AnnounceTrainingsJob').run()
  }
}
