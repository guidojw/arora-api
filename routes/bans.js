'use strict'
const express = require('express')
const router = express.Router()

const banController = require('../app/controllers/v1/ban')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/request')
const { authenticate } = require('../app/controllers/v1/auth')

router.get('/', banController.validate('getBans'), handleValidationResult, banController.getBans)

router.post('/', banController.validate('ban'), handleValidationResult, authenticate, banController.ban)

router.put('/:userId', banController.validate('putBan'), handleValidationResult, authenticate, parseParams,
    banController.putBan)

module.exports = router
