'use strict'
const express = require('express')
const router = express.Router()
const { trelloController } = require('../controllers/v1')
const { errorMiddleware, authMiddleware } = require('../middlewares')
const { handleValidationResult } = errorMiddleware
const { verifyTrelloWebhookRequest } = authMiddleware

router.head('/', trelloController.head)

router.post('/', trelloController.validate('postWebhook'), handleValidationResult, verifyTrelloWebhookRequest,
    trelloController.postWebhook)

module.exports = router
