import type { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { injectable } from 'inversify'
import { validationResult } from 'express-validator'

export type Errors = Array<{ message: string }>

@injectable()
export default class ErrorMiddleware extends BaseMiddleware {
  public handler (req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      next()
      return
    }
    this.sendErrors(res, 422, errors
      .array({ onlyFirstError: true })
      .map(({ param, location, msg }) => ({
        param,
        location,
        message: msg
      }))
    )
  }

  public sendError (res: Response, statusCode: number, message: string): void {
    this.sendErrors(res, statusCode, [{ message }])
  }

  private sendErrors (res: Response, statusCode: number, errors: Errors): void {
    res.status(statusCode).send({ errors })
  }
}
