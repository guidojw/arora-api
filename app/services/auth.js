'use strict'
const createError = require('http-errors')

const models = require('../models')

exports.authenticate = async (id, key) => {
    const admin = await models.Admin.findById(id)
    if (admin !== null && key === admin.key) {
        return true
    } else {
        throw createError(401, 'Incorrect authentication key')
    }
}
