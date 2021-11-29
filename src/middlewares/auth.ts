import type { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthService } from '../services'
import { BaseMiddleware } from 'inversify-express-utils'
import { UnauthorizedError } from '../errors'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class AuthMiddleware extends BaseMiddleware {
  @inject(TYPES.AuthService) private readonly authService!: AuthService

  public handler (req: Request, _res: Response, next: NextFunction): void {
    const token = req.header('authorization')?.replace('Bearer ', '') ?? undefined

    this.authenticateToken(token)
    next()
  }

  public authenticateWebSocketConnection (req: Request): void {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? undefined

    this.authenticateToken(token)
  }

  private authenticateToken (token?: string): void {
    if (typeof token === 'undefined' || !this.authService.authenticate(token)) {
      throw new UnauthorizedError('Invalid authentication key.')
    }
  }
}
