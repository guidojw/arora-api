'use strict'
require('dotenv').config()

const createError = require('http-errors')
const crypto = require('crypto')
const { authService } = require('../services')

exports.authenticate = (req, _res, next) => {
    const token = req.header('authorization').replace('Bearer ', '')
    if (!authService.authenticate(token)) throw createError(401, 'Invalid authentication key.')
    next()
}

exports.verifyTrelloWebhookRequest = (req, _res, next) => {
    const base64Digest = content => {
        return crypto.createHmac('sha1', process.env.TRELLO_SECRET).update(content).digest('base64')
    }
    const content = JSON.stringify(req.body) + `https://${req.hostname}${req.baseUrl}`
    const doubleHash = base64Digest(content)
    const headerHash = req.headers['x-trello-webhook']
    if (doubleHash !== headerHash) throw createError(401, 'Invalid signature.')
    next()
}
