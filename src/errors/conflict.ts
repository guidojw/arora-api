import BaseError from './base'

export default class ConflictError extends BaseError {
  constructor (message?: string) {
    super(message ?? 'Conflict', 409)
  }
}
