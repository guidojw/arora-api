import BaseError from './base'

export default class UnauthorizedError extends BaseError {
  constructor (message?: string) {
    super(message ?? 'Unauthorized', 401)
  }
}
