'use strict'
module.exports = class ConflictError extends Error {
    constructor (message) {
        super(message)

        this.name = this.constructor.name
        this.status = 409
    }
}
