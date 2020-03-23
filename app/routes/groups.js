'use strict'
const express = require('express')
const router = express.Router()

const groupController = require('../controllers/v1/group')

const { handleValidationResult } = require('../middlewares/error')
const { parseParams } = require('../middlewares/request')
const { authenticate } = require('../middlewares/auth')

router.post('/:groupId/suspensions', groupController.validate('suspend'), handleValidationResult, authenticate,
    parseParams, groupController.suspend)

router.post('/:groupId/promote/:userId', groupController.validate('promote'), handleValidationResult,
    authenticate, parseParams, groupController.promote)

router.get('/:groupId/shout', groupController.validate('getShout'), handleValidationResult, authenticate,
    parseParams, groupController.getShout)

router.get('/:groupId/suspensions', groupController.validate('getSuspensions'), handleValidationResult,
    authenticate, parseParams, groupController.getSuspensions)

router.get('/:groupId/trainings', groupController.validate('getTrainings'), handleValidationResult,
    authenticate, parseParams, groupController.getTrainings)

router.post('/:groupId/trainings', groupController.validate('hostTraining'), handleValidationResult,
    authenticate, parseParams, groupController.hostTraining)

router.get('/:groupId/exiles', groupController.validate('getExiles'), handleValidationResult, authenticate,
    parseParams, groupController.getExiles)

router.get('/:groupId/suspensions/finished', groupController.validate('getFinishedSuspensions'),
    handleValidationResult, authenticate, parseParams, groupController.getFinishedSuspensions)

router.get('/:groupId/suspensions/:userId', groupController.validate('getSuspension'), handleValidationResult,
    authenticate, parseParams, groupController.getSuspension)

router.get('/:groupId/trainings/:trainingId', groupController.validate('getTraining'), handleValidationResult,
    authenticate, parseParams, groupController.getTraining)

router.post('/:groupId/shout', groupController.validate('shout'), handleValidationResult, authenticate,
    parseParams, groupController.shout)

router.put('/:groupId/trainings/:trainingId', groupController.validate('putTraining'), handleValidationResult,
    authenticate, parseParams, groupController.putTraining)

router.put('/:groupId/suspensions/:userId', groupController.validate('putSuspension'), handleValidationResult,
    authenticate, parseParams, groupController.putSuspension)

router.get('/:groupId', groupController.validate('getGroup'), handleValidationResult, authenticate,
    parseParams, groupController.getGroup)

router.post('/:groupId/trainings/:trainingId/announce', groupController.validate('announceTraining'),
    handleValidationResult, authenticate, parseParams, groupController.announceTraining)

module.exports = router
