const { validationResult } = require('express-validator')

exports.handleValidationResult = (res, req, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
    return res.status(422).json({
        errors: extractedErrors
    })
}

exports.sendError = (res, statusCode, message) => {
    res.status(statusCode).send({"error": message})
}
