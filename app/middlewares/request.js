'use strict'
exports.parseParams = (req, res, next) => {
    for (const index in req.params) {
        const parsed = parseInt(req.params[index])
        if (!isNaN(parsed)) req.params[index] = parsed
    }
    next()
}
