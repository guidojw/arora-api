'use strict'
const createError = require('http-errors')

const authService = require('../services/auth')

exports.authenticate = (req, res, next) => {
    const token = req.header('authorization').replace('Bearer ', '')
    if (!authService.authenticate(token)) throw createError(401, 'Incorrect authentication key')
    next()
}
