'use strict'
const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/params')
const { authenticate } = require('../app/controllers/auth')

router.post('/:groupId/suspend/:userId', groupController.validate('suspend'), handleValidationResult,
    authenticate, parseParams, groupController.suspend)

router.get('/:groupId/rank/:userId', groupController.validate('getRank'), handleValidationResult, parseParams,
    groupController.getRank)

router.post('/:groupId/promote/:userId', groupController.validate('promote'), handleValidationResult,
    authenticate, parseParams, groupController.promote)

module.exports = router
