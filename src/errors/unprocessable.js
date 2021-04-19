'use strict'

class UnprocessableError extends Error {
  constructor (message) {
    super(message || 'Unprocessable')

    this.name = this.constructor.name
    this.statusCode = 422
  }
}

module.exports = UnprocessableError
