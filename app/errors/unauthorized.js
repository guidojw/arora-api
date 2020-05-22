'use strict'
class UnauthorizedError extends Error {
    constructor (message) {
        super(message || 'Unauthorized')

        this.name = this.constructor.name
        this.status = 401
    }
}

module.exports = UnauthorizedError
