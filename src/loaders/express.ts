import { BaseError, NotFoundError } from '../errors'
import express, { Application, NextFunction, Request, Response } from 'express'
import { ContainerBuilder } from 'node-dependency-injection'
import Sentry from '@sentry/node'
import helmet from 'helmet'
import hpp from 'hpp'
import logger from 'morgan'

export default function init (app: Application, container: ContainerBuilder): void {
  const errorMiddleware = container.get('ErrorMiddleware')

  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    app.use(Sentry.Handlers.requestHandler())
  }

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(helmet())
  app.use(hpp())

  app.use('/v1/groups', [container.get('GroupsRouter')])
  app.use('/v1/users', [container.get('UsersRouter')])
  app.use('/v1/catalog', [container.get('CatalogRouter')])
  app.use('/v1/status', [container.get('StatusRouter')])

  app.use(() => {
    throw new NotFoundError()
  })

  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    app.use(Sentry.Handlers.errorHandler())
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    errorMiddleware.sendError(res, err instanceof BaseError ? err.statusCode : 500, err.message)
  })
}
