import { Application } from 'express'
import { BaseJob } from '../jobs'
import { BaseManager } from '../managers'
import Sentry from '@sentry/node'
import { constants } from '../util'
import containerLoader from './container'
import cronConfig from '../configs/cron'
import cronLoader from './cron'
import expressLoader from './express'

const { TYPES } = constants

export async function init (): Promise<Application> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH
    })
  }

  const container = await containerLoader()
  await container.get<BaseManager>(TYPES.RobloxManager).init()
  container.get<BaseManager>(TYPES.WebSocketManager).init()

  const app = expressLoader(container)
  cronLoader(container)

  if (typeof cronConfig.announceTrainingsJob !== 'undefined') {
    await container.get<BaseJob>(TYPES.AnnounceTrainingsJob).run()
  }

  return app
}
