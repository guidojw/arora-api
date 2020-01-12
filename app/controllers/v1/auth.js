'use strict'
const authService = require('../../services/auth')

exports.authenticate = async (req, res, next) => {
    await authService.authenticate(req.body.id, req.body.key)
    next()
}
