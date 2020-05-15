'use strict'
const express = require('express')
const router = express.Router()
const groupController = require('../controllers/v1/group')
const { handleValidationResult } = require('../middlewares/error')
const { authenticate } = require('../middlewares/auth')

router.post('/:groupId/suspensions', groupController.validate('suspend'), handleValidationResult, authenticate,
    groupController.suspend)

router.get('/:groupId/shout', groupController.validate('getShout'), handleValidationResult, authenticate,
    groupController.getShout)

router.get('/:groupId/suspensions', groupController.validate('getSuspensions'), handleValidationResult,
    authenticate, groupController.getSuspensions)

router.get('/:groupId/trainings', groupController.validate('getTrainings'), handleValidationResult,
    authenticate, groupController.getTrainings)

router.post('/:groupId/trainings', groupController.validate('postTraining'), handleValidationResult,
    authenticate, groupController.postTraining)

router.get('/:groupId/exiles', groupController.validate('getExiles'), handleValidationResult, authenticate,
    groupController.getExiles)

router.get('/:groupId/suspensions/finished', groupController.validate('getFinishedSuspensions'),
    handleValidationResult, authenticate, groupController.getFinishedSuspensions)

router.get('/:groupId/suspensions/:userId', groupController.validate('getSuspension'), handleValidationResult,
    authenticate, groupController.getSuspension)

router.get('/:groupId/trainings/:trainingId', groupController.validate('getTraining'), handleValidationResult,
    authenticate, groupController.getTraining)

router.post('/:groupId/shout', groupController.validate('shout'), handleValidationResult, authenticate,
    groupController.shout)

router.put('/:groupId/trainings/:trainingId', groupController.validate('putTraining'), handleValidationResult,
    authenticate, groupController.putTraining)

router.put('/:groupId/suspensions/:userId', groupController.validate('putSuspension'), handleValidationResult,
    authenticate, groupController.putSuspension)

router.get('/:groupId', groupController.validate('getGroup'), handleValidationResult, authenticate,
    groupController.getGroup)

router.post('/:groupId/trainings/:trainingId/announce', groupController.validate('announceTraining'),
    handleValidationResult, authenticate, groupController.announceTraining)

router.post('/:groupId/suspensions/:userId/cancel', groupController.validate('cancelSuspension'),
    handleValidationResult, authenticate, groupController.cancelSuspension)

router.post('/:groupId/trainings/:trainingId/cancel', groupController.validate('cancelTraining'),
    handleValidationResult, authenticate, groupController.cancelTraining)

router.post('/:groupId/suspensions/:userId/extend', groupController.validate('extendSuspension'),
    handleValidationResult, authenticate, groupController.extendSuspension)

router.put('/:groupId/users/:userId', groupController.validate('putUser'), handleValidationResult,
    authenticate, groupController.putUser)

module.exports = router
