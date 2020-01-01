'use strict'
const createError = require('http-errors')

const models = require('../../models')

exports.authenticate = async (req, res, next) => {
    const admin = await models.Admin.findById(req.body.id)
    if (admin !== null && req.body.key === admin.key) {
        next()
    } else {
        throw createError(401, 'Incorrect authentication key')
    }
}
