'use strict'

const { UnauthorizedError } = require('../errors')

class AuthMiddleware {
  constructor (authService) {
    this._authService = authService
  }

  authenticate (req, _res, next) {
    const token = req.header('authorization').replace('Bearer ', '')

    if (!this._authService.authenticate(token)) {
      throw new UnauthorizedError('Invalid authentication key.')
    }
    next()
  }

  authenticateWebSocketConnection (req) {
    // Check for existence of the authorization header as these
    // requests are not checked by express-validator
    const token = req.headers.authorization !== undefined
      ? req.headers.authorization.replace('Bearer ', '')
      : undefined

    if (!this._authService.authenticate(token)) {
      throw new UnauthorizedError('Invalid authentication key.')
    }
  }
}

module.exports = AuthMiddleware
