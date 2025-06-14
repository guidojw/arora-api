import './axios'
import * as Sentry from '@sentry/node'
import type { Application } from 'express'
import type { BaseJob } from '../jobs'
import type { BaseManager } from '../managers'
import { constants } from '../util'
import containerLoader from './container'
import cronConfig from '../configs/cron'
import cronLoader from './cron'
import expressLoader from './express'
import fs from 'node:fs/promises'

const { TYPES } = constants

export async function init (): Promise<Application> {
  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.BUILD_HASH,
      integrations: [
        Sentry.rewriteFramesIntegration({
          root: process.cwd()
        })
      ],
      sendDefaultPii: true,
      tracesSampleRate: 0.2
    })
  }

  const container = await containerLoader()
  await container.get<BaseManager>(TYPES.RobloxManager).init()
  container.get<BaseManager>(TYPES.WebSocketManager).init()

  const app = expressLoader(container)
  cronLoader(container)

  if (typeof process.env.KUBERNETES_SERVICE_HOST !== 'undefined') {
    await fs.writeFile('/tmp/healthy', '')
  }

  if (typeof cronConfig.announceTrainingsJob !== 'undefined' && (process.env.NODE_ENV ?? 'development') !==
    'development') {
    await container.get<BaseJob>(TYPES.AnnounceTrainingsJob).run()
  }

  return app
}
