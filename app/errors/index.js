'use strict'
const ForbiddenError = require('./forbidden')
const NotFoundError = require('./not-found')
const ConflictError = require('./conflict')

module.exports = {
    ForbiddenError,
    NotFoundError,
    ConflictError
}
