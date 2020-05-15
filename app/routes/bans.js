'use strict'
const express = require('express')
const router = express.Router()
const banController = require('../controllers/v1/ban')
const { handleValidationResult } = require('../middlewares/error')

router.get('/', banController.validate('getBans'), handleValidationResult, banController.getBans)

router.post('/', banController.validate('ban'), handleValidationResult, banController.ban)

router.put('/:userId', banController.validate('putBan'), handleValidationResult, banController.putBan)

router.get('/:userId', banController.validate('getBan'), handleValidationResult, banController.getBan)

router.post('/:userId/cancel', banController.validate('cancelBan'), handleValidationResult, banController
    .cancelBan)

module.exports = router
