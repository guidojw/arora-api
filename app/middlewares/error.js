'use strict'
const { validationResult } = require('express-validator')

async function handleValidationResult (req, res, next) {
    const errors = await validationResult(req)
    if (errors.isEmpty()) return next()
    sendErrors(res, 422, errors.array())
}

function sendError (res, statusCode, message) {
    sendErrors(res, statusCode, [{ message }])
}

function sendErrors (res, statusCode, errors) {
    res.status(statusCode).send({ errors })
}

module.exports = {
    handleValidationResult,
    sendError,
    sendErrors
}
