'use strict'
const express = require('express')
const router = express.Router()

const qotdController = require('../app/controllers/qotd')

const { handleValidationResult } = require('../app/helpers/error')
const { authenticate } = require('../app/controllers/auth')

router.post('/', qotdController.validate('suggest'), handleValidationResult, authenticate, qotdController
    .suggest)

module.exports = router
