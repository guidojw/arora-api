'use strict'
const { validationResult } = require('express-validator')

exports.handleValidationResult = async (req, res, next) => {
    const errors = await validationResult(req)
    if (errors.isEmpty()) return next()
    exports.sendErrors(res, 422, {errors: errors.array()})
}

exports.sendError = (res, statusCode, message) => {
    exports.sendErrors(res, statusCode, [{message: message}])
}

exports.sendErrors = (res, statusCode, errors) => {
    res.status(statusCode).send({errors: errors})
}
