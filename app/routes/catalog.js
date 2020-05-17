'use strict'
const express = require('express')
const router = express.Router()
const { catalogController } = require('../controllers/v1')
const { errorMiddleware, authMiddleware } = require('../middlewares')
const { handleValidationResult } = errorMiddleware
const { authenticate } = authMiddleware

router.get('/', catalogController.validate('getItems'), handleValidationResult, authenticate, catalogController
    .getItems)

module.exports = router
