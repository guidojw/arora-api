'use strict'
const crypto = require('crypto')

const { UnauthorizedError } = require('../errors')

class AuthMiddleware {
    constructor(authService) {
        this._authService = authService
    }

    authenticate(req, _res, next) {
        const token = req.header('authorization').replace('Bearer ', '')
        try {
            this._authService.verify(token)
        } catch {
            throw new UnauthorizedError('Invalid authentication key.')
        }
        next()
    }

    verifyTrelloWebhookRequest(req, _res, next) {
        const base64Digest = content => {
            return crypto.createHmac('sha1', process.env.TRELLO_SECRET).update(content)
                .digest('base64')
        }
        const content = JSON.stringify(req.body) + `https://${req.hostname}${req.baseUrl}`
        const doubleHash = base64Digest(content)
        const headerHash = req.headers['x-trello-webhook']

        if (doubleHash !== headerHash) {
            throw new UnauthorizedError('Invalid signature.')
        }
        next()
    }
}

module.exports = AuthMiddleware
