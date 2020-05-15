'use strict'
const express = require('express')
const router = express.Router()
const catalogController = require('../controllers/v1/catalog')
const { handleValidationResult } = require('../middlewares/error')

router.get('/', catalogController.validate('getItems'), handleValidationResult, catalogController.getItems)

module.exports = router
