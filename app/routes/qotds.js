'use strict'
const express = require('express')
const router = express.Router()

const qotdController = require('../controllers/v1/qotd')

const { handleValidationResult } = require('../middlewares/error')
const { authenticate } = require('../middlewares/auth')

router.post('/', qotdController.validate('suggest'), handleValidationResult, authenticate, qotdController
    .suggest)

module.exports = router
