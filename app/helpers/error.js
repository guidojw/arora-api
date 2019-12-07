'use strict'
const { validationResult } = require('express-validator')

exports.handleValidationResult = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
    exports.sendErrors(res, 422, extractedErrors)
}

exports.sendError = (res, statusCode, message) => {
    exports.sendErrors(res, statusCode, [{"message": message}])
}

exports.sendErrors = (res, statusCode, errors) => {
    res.status(statusCode).send({"errors": errors})
}
