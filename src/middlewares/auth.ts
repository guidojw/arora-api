import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services'
import { UnauthorizedError } from '../errors'

export default class AuthMiddleware {
  _authService: AuthService

  constructor (authService: AuthService) {
    this._authService = authService
  }

  authenticate (req: Request, _res: Response, next: NextFunction): void {
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
