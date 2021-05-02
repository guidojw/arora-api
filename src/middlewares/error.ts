import { NextFunction, Request, Response } from 'express'
import { BaseMiddleware } from 'inversify-express-utils'
import { injectable } from 'inversify'
import { validationResult } from 'express-validator'

export type Errors = Array<{ message: string }>

@injectable()
export default class ErrorMiddleware extends BaseMiddleware {
  async handler (req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = await validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    this.sendErrors(res, 422, errors
      .array({ onlyFirstError: true })
      .map(error => ({ message: error.msg }))
    )
  }

  sendError (res: Response, statusCode: number, message: string): void {
    this.sendErrors(res, statusCode, [{ message }])
  }

  sendErrors (res: Response, statusCode: number, errors: Errors): void {
    res.status(statusCode).send({ errors })
  }
}
