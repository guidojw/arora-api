'use strict'
const express = require('express')
const router = express.Router()

const catalogController = require('../controllers/v1/catalog')

const { handleValidationResult } = require('../middlewares/error')
const { authenticate } = require('../middlewares/auth')

router.get('/', catalogController.validate('getItems'), handleValidationResult, authenticate, catalogController
    .getItems)

module.exports = router
