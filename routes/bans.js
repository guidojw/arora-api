'use strict'
const express = require('express')
const router = express.Router()

const banController = require('../app/controllers/ban')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/params')
const { authenticate } = require('../app/controllers/auth')

router.get('/', banController.validate('getBans'), handleValidationResult, banController.getBans)

module.exports = router
