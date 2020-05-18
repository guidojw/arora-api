'use strict'
const express = require('express')
const router = express.Router()
const trelloController = require('../controllers/v1/trello')
const { handleValidationResult } = require('../middlewares/error')
const { verifyTrelloWebhookRequest } = require('../middlewares/auth')

router.head('/', trelloController.head)

router.post('/', trelloController.validate('postWebhook'), handleValidationResult, verifyTrelloWebhookRequest,
    trelloController.postWebhook)

module.exports = router
