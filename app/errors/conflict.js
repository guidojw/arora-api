'use strict'
class ConflictError extends Error {
  constructor (message) {
    super(message || 'Conflict')

    this.name = this.constructor.name
    this.statusCode = 409
  }
}

module.exports = ConflictError
