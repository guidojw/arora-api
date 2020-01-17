'use strict'
const express = require('express')
const router = express.Router()

const trelloController = require('../controllers/v1/trello')

const { handleValidationResult } = require('../middlewares/error')

router.head('/', trelloController.head)

router.post('/', trelloController.validate('postWebhook'), handleValidationResult, trelloController
    .postWebhook)

module.exports = router
