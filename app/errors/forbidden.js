'use strict'
module.exports = class ForbiddenError extends Error {
    constructor (message) {
        super(message)

        this.name = this.constructor.name
        this.status = 403
    }
}
