import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthService } from '../services'
import { BaseMiddleware } from 'inversify-express-utils'
import TYPES from '../util/types'
import { UnauthorizedError } from '../errors'

@injectable()
export default class AuthMiddleware extends BaseMiddleware {
  @inject(TYPES.AuthService) private readonly _authService!: AuthService

  handler (req: Request, _res: Response, next: NextFunction): void {
    const token = req.header('authorization')?.replace('Bearer ', '') ?? undefined

    this.authenticateToken(token)
    next()
  }

  authenticateWebSocketConnection (req: Request): void {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? undefined

    this.authenticateToken(token)
  }

  private authenticateToken (token?: string): void {
    if (typeof token === 'undefined' || !this._authService.authenticate(token)) {
      throw new UnauthorizedError('Invalid authentication key.')
    }
  }
}
