import BaseError from './base'

export default class UnprocessableError extends BaseError {
  public constructor (message?: string) {
    super(message ?? 'Unprocessable', 422)
  }
}
