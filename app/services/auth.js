'use strict'
const jwt = require('jsonwebtoken')
const fs = require('fs')
const UnauthorizedError = require('../errors/unauthorized')

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

exports.authenticate = token => {
    try {
        exports._verify(token)
        return true
    } catch {
        return false
    }
}

exports.authenticateWebSocketConnection = req => {
    // Check for existence of the authorization header as these
    // requests are not checked by express-validator
    const token = req.headers.authorization !== undefined
        ? req.headers.authorization.replace('Bearer ', '')
        : undefined

    if (!exports.authenticate(token)) {
        throw new UnauthorizedError('Invalid authentication key.')
    }
}

exports._verify = token => {
    return jwt.verify(token, publicKey, { algorithm: ['RS256'] })
}

// exports._sign = payload => {
//     return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
// }
