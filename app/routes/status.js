'use strict'
const express = require('express')
const router = express.Router()

const statusController = require('../controllers/v1/status')

const { handleValidationResult } = require('../middlewares/error')
const { authenticate } = require('../middlewares/auth')

router.get('/', statusController.validate('getStatus'), handleValidationResult, authenticate, statusController
    .getStatus)

module.exports = router
