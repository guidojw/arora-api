import BaseError from './base'

export default class ForbiddenError extends BaseError {
  public constructor (message?: string) {
    super(message ?? 'Forbidden', 403)
  }
}
