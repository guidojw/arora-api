'use strict'
const express = require('express')
const router = express.Router()

const userController = require('../app/controllers/user')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/params')
const { authenticate } = require('../app/controllers/auth')

router.get('/:username/user-id', userController.validate('getUserId'), handleValidationResult, userController
    .getUserId)

router.get('/:userId/join-date', userController.validate('getJoinDate'), handleValidationResult, parseParams,
    userController.getJoinDate)

module.exports = router
