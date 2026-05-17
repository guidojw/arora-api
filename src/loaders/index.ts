import './axios'
import type { Application } from 'express'
import type { BaseManager } from '../managers'
import Bree from 'bree'
import { constants } from '../util'
import containerLoader from './container'
import cronLoader from './cron'
import expressLoader from './express'
import fs from 'node:fs/promises'
import path from 'node:path'

const { TYPES } = constants

export async function init (): Promise<Application> {
  const container = await containerLoader()
  container.get<BaseManager>(TYPES.WebSocketManager).init()

  const app = expressLoader(container)
  cronLoader(container)

  if (typeof process.env.KUBERNETES_SERVICE_HOST !== 'undefined') {
    await fs.writeFile('/tmp/healthy', '')
  }

  const bree = new Bree({
    root: path.resolve(__dirname, '../jobs'),
    jobs: [{
      name: 'refresh-access-tokens',
      timeout: '1h',
      interval: '1d'
    }]
  })
  await bree.start()

  return app
}
