'use strict'
const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group')

const { handleValidationResult } = require('../app/helpers/error')
const { parseParams } = require('../app/helpers/params')
const { authenticate } = require('../app/controllers/auth')

router.post('/:groupId/suspensions', groupController.validate('suspend'), handleValidationResult,
    authenticate, parseParams, groupController.suspend)

router.get('/:groupId/rank/:userId', groupController.validate('getRank'), handleValidationResult, parseParams,
    groupController.getRank)

router.post('/:groupId/promote/:userId', groupController.validate('promote'), handleValidationResult,
    authenticate, parseParams, groupController.promote)

router.get('/:groupId/shout', groupController.validate('getShout'), handleValidationResult, parseParams,
    groupController.getShout)

router.get('/:groupId/role/:userId', groupController.validate('getRole'), handleValidationResult, parseParams,
    groupController.getRole)

router.get('/:groupId/suspensions', groupController.validate('getSuspensions'), handleValidationResult,
    parseParams, groupController.getSuspensions)

router.get('/:groupId/trainings', groupController.validate('getTrainings'), handleValidationResult,
    parseParams, groupController.getTrainings)

router.post('/:groupId/trainings', groupController.validate('hostTraining'), handleValidationResult,
    authenticate, parseParams, groupController.hostTraining)

router.get('/:groupId/exiles', groupController.validate('getExiles'), handleValidationResult, parseParams,
    groupController.getExiles)

router.get('/:groupId/suspensions/:userId', groupController.validate('getSuspension'), handleValidationResult,
    parseParams, groupController.getSuspension)

router.get('/:groupId/trainings/:trainingId', groupController.validate('getTraining'), handleValidationResult,
    parseParams, groupController.getTraining)

router.post('/:groupId/shout', groupController.validate('shout'), handleValidationResult, parseParams,
    groupController.shout)

module.exports = router
