'use strict'
const jwt = require('jsonwebtoken')
const fs = require('fs')

const { UnauthorizedError } = require('../errors')

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

class AuthService {
    authenticate(token) {
        try {
            this._verify(token)
            return true
        } catch {
            return false
        }
    }

    authenticateWebSocketConnection(req) {
        // Check for existence of the authorization header as these
        // requests are not checked by express-validator
        const token = req.headers.authorization !== undefined
            ? req.headers.authorization.replace('Bearer ', '')
            : undefined

        if (!this.authenticate(token)) {
            throw new UnauthorizedError('Invalid authentication key.')
        }
    }

    _verify(token) {
        return jwt.verify(token, publicKey, { algorithm: ['RS256'] })
    }

    // _sign(payload) {
    //     return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
    // }
}

module.exports = AuthService
