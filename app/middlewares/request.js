'use strict'
exports.parseParams = (req, res, next) => {
    for (const index in req.params) {
        const parsed = parseInt(req.params[index])
        if (!isNaN(parsed)) req.params[index] = parsed
    }
    next()
}

exports.parseQuery = async (req, res, next) => {
    for (const index in req.query) {
        const parsed = parseInt(req.query[index])
        if (!isNaN(parsed)) req.query[index] = parsed
    }
    next()
}
