'use strict'
const express = require('express')
const router = express.Router()

const qotdController = require('../app/controllers/v1/qotd')

const { handleValidationResult } = require('../app/helpers/error')
const { authenticate } = require('../app/controllers/v1/auth')

router.post('/', qotdController.validate('suggest'), handleValidationResult, authenticate, qotdController
    .suggest)

module.exports = router
