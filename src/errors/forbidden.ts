import BaseError from './base'

export default class ForbiddenError extends BaseError {
  constructor (message?: string) {
    super(message ?? 'Forbidden', 403)
  }
}
