'use strict'
const express = require('express')
const router = express.Router()

const statusController = require('../controllers/v1/status')

const { handleValidationResult } = require('../middlewares/error')

router.get('/', statusController.validate('getStatus'), handleValidationResult, statusController.getStatus)

module.exports = router
