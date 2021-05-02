import express, { Application, NextFunction, Request, Response } from 'express'
import { Container } from 'inversify'
import ErrorMiddleware from '../middlewares/error'
import { NotFoundError } from '../errors'
import Sentry from '@sentry/node'
import TYPES from '../util/types'
import helmet from 'helmet'
import hpp from 'hpp'
import logger from 'morgan'

export default function init (app: Application, container: Container): void {
  const errorMiddleware = container.get<ErrorMiddleware>(TYPES.ErrorMiddleware)

  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    app.use(Sentry.Handlers.requestHandler())
  }

  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(helmet())
  app.use(hpp())

  app.use(() => {
    throw new NotFoundError()
  })

  if (typeof process.env.SENTRY_DSN !== 'undefined') {
    app.use(Sentry.Handlers.errorHandler())
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    errorMiddleware.sendError(res, err.statusCode ?? 500, err.message ?? 'Internal Server Error')
  })
}
