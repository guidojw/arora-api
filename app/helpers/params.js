'use strict'
exports.parseParams = async (req, res, next) => {
    for (const param in req.params) {
        req.params[param] = await parseInt(req.params[param])
    }
    next()
}
