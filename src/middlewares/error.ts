import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export type Errors = Array<{ message: string }>

export default class ErrorMiddleware {
  async handleValidationResult (req: Request, res: Response, next: NextFunction): Promise<void> {
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
