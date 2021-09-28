import '../controllers'
import * as Sentry from '@sentry/node'
import express, { Application, ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express'
import { Container } from 'inversify'
import ErrorMiddleware from '../middlewares/error'
import { InversifyExpressServer } from 'inversify-express-utils'
import { NotFoundError } from '../errors'
import { constants } from '../util'
import helmet from 'helmet'
import hpp from 'hpp'
import logger from 'morgan'

const { TYPES } = constants

export default function init (container: Container): Application {
  return new InversifyExpressServer(container)
    .setConfig(app => {
      app.set('container', container)

      if (typeof process.env.SENTRY_DSN !== 'undefined') {
        app.use(Sentry.Handlers.requestHandler() as RequestHandler)
      }

      app.use(logger('dev') as RequestHandler)
      app.use(express.json() as RequestHandler)
      app.use(express.urlencoded({ extended: false }) as RequestHandler)
      app.use(helmet() as RequestHandler)
      app.use(hpp())
    })
    .setErrorConfig(app => {
      const errorMiddleware = container.get<ErrorMiddleware>(TYPES.ErrorMiddleware)

      app.use(() => {
        throw new NotFoundError()
      })

      if (typeof process.env.SENTRY_DSN !== 'undefined') {
        app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler)
      }

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        errorMiddleware.sendError(
          res,
          err.response?.status ?? err.statusCode ?? 500,
          err.response?.statusText ?? err.message ?? 'Internal Server Error'
        )
      })
    })
    .build()
}
