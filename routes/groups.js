'use strict'
const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/params')

router.post('/v1/:groupId/suspend/:userId', groupController.validate('suspend'), handleValidationResult,
    parseParams, groupController.suspend)

router.get('/v1/:groupId/rank/:userId', groupController.validate('getRank'), handleValidationResult, parseParams,
    groupController.getRank)

router.post('/v1/:groupId/promote/:userId', groupController.validate('promote'), handleValidationResult,
    parseParams, groupController.promote)

module.exports = router
