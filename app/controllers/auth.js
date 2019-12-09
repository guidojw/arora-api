'use strict'
const createError = require('http-errors')

const models = require('../models')

exports.authenticate = async (req, res, next) => {
    try {
        const admin = await models.Admin.findById(req.body.id)
        if (admin !== undefined && req.body.key === admin.key) {
            next()
        } else {
            next(createError(401, 'Incorrect authentication key'))
        }
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
