'use strict'
class ConflictError extends Error {
    constructor (message) {
        super(message)

        this.name = this.constructor.name
        this.status = 409
    }
}

module.exports = ConflictError
