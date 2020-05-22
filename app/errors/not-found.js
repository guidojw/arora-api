'use strict'
class NotFoundError extends Error {
    constructor (message) {
        super(message || 'Not Found')

        this.name = this.constructor.name
        this.status = 404
    }
}

module.exports = NotFoundError
