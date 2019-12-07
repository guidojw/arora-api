'use strict'
exports.parseParams = (req, res, next) => {
    for (const param in req.params) {
        req.params[param] = parseInt(req.params[param])
    }
    next()
}
