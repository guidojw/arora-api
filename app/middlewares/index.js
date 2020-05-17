'use strict'
const authMiddleware = require('./auth')
const errorMiddleware = require('./error')

module.exports = {
    authMiddleware,
    errorMiddleware
}
