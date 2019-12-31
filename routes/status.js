'use strict'
const express = require('express')
const router = express.Router()

const statusController = require('../app/controllers/v1/status')

const { handleValidationResult } = require('../app/helpers/error')

router.get('/', statusController.validate('getStatus'), handleValidationResult, statusController.getStatus)

module.exports = router
