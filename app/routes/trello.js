'use strict'
const express = require('express')

class TrelloRouter {
    constructor(trelloController, { handleValidationResult }, { verifyTrelloWebhookRequest }) {
        const router = express.Router()

        router.head('/', trelloController.head)

        router.post('/', trelloController.validate('postWebhook'), handleValidationResult, verifyTrelloWebhookRequest,
            trelloController.postWebhook)

        return router
    }
}

module.exports = TrelloRouter
