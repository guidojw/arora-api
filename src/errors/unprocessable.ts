import BaseError from './base'

export default class UnprocessableError extends BaseError {
  constructor (message?: string) {
    super(message ?? 'Unprocessable', 422)
  }
}
