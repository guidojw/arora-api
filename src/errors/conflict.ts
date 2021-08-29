import BaseError from './base'

export default class ConflictError extends BaseError {
  public constructor (message?: string) {
    super(message ?? 'Conflict', 409)
  }
}
