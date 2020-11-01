'use strict'
class BadRequestError extends Error {
  constructor (message) {
    super(message || 'Bad Request')

    this.name = this.constructor.name
    this.statusCode = 400
  }
}

module.exports = BadRequestError
