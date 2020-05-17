'use strict'
const express = require('express')
const router = express.Router()
const { banController } = require('../controllers/v1')
const { errorMiddleware, authMiddleware } = require('../middlewares')
const { handleValidationResult } = errorMiddleware
const { authenticate } = authMiddleware

router.get('/', banController.validate('getBans'), handleValidationResult, authenticate, banController.getBans)

router.post('/', banController.validate('ban'), handleValidationResult, authenticate, banController.ban)

router.put('/:userId', banController.validate('putBan'), handleValidationResult, authenticate, banController
    .putBan)

router.get('/:userId', banController.validate('getBan'), handleValidationResult, authenticate, banController
    .getBan)

router.post('/:userId/cancel', banController.validate('cancelBan'), handleValidationResult, authenticate,
    banController.cancelBan)

module.exports = router
