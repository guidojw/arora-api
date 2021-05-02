import { Application } from 'express'
import { BaseJob } from '../jobs'
import { BaseManager } from '../managers'
import Sentry from '@sentry/node'
import TYPES from '../util/types'
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

  await container.get<BaseManager>(TYPES.RobloxManager).init()
  container.get<BaseManager>(TYPES.WebSocketManager).init()

  expressLoader(app, container)
  cronLoader(container)

  if (typeof cronConfig.announceTrainingsJob !== 'undefined') {
    await container.get<BaseJob>(TYPES.AnnounceTrainingsJob).run()
  }
}
