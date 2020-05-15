'use strict'
const express = require('express')
const router = express.Router()
const groupController = require('../controllers/v1/group')
const { handleValidationResult } = require('../middlewares/error')

router.post('/:groupId/suspensions', groupController.validate('suspend'), handleValidationResult,
    groupController.suspend)

router.get('/:groupId/shout', groupController.validate('getShout'), handleValidationResult, groupController
    .getShout)

router.get('/:groupId/suspensions', groupController.validate('getSuspensions'), handleValidationResult,
    groupController.getSuspensions)

router.get('/:groupId/trainings', groupController.validate('getTrainings'), handleValidationResult,
    groupController.getTrainings)

router.post('/:groupId/trainings', groupController.validate('postTraining'), handleValidationResult,
    groupController.postTraining)

router.get('/:groupId/exiles', groupController.validate('getExiles'), handleValidationResult, groupController
    .getExiles)

router.get('/:groupId/suspensions/finished', groupController.validate('getFinishedSuspensions'),
    handleValidationResult, groupController.getFinishedSuspensions)

router.get('/:groupId/suspensions/:userId', groupController.validate('getSuspension'), handleValidationResult,
    groupController.getSuspension)

router.get('/:groupId/trainings/:trainingId', groupController.validate('getTraining'), handleValidationResult,
    groupController.getTraining)

router.post('/:groupId/shout', groupController.validate('shout'), handleValidationResult, groupController
    .shout)

router.put('/:groupId/trainings/:trainingId', groupController.validate('putTraining'), handleValidationResult,
    groupController.putTraining)

router.put('/:groupId/suspensions/:userId', groupController.validate('putSuspension'), handleValidationResult,
    groupController.putSuspension)

router.get('/:groupId', groupController.validate('getGroup'), handleValidationResult, groupController.getGroup)

router.post('/:groupId/trainings/:trainingId/announce', groupController.validate('announceTraining'),
    handleValidationResult, groupController.announceTraining)

router.post('/:groupId/suspensions/:userId/cancel', groupController.validate('cancelSuspension'),
    handleValidationResult, groupController.cancelSuspension)

router.post('/:groupId/trainings/:trainingId/cancel', groupController.validate('cancelTraining'),
    handleValidationResult, groupController.cancelTraining)

router.post('/:groupId/suspensions/:userId/extend', groupController.validate('extendSuspension'),
    handleValidationResult, groupController.extendSuspension)

router.put('/:groupId/users/:userId', groupController.validate('putUser'), handleValidationResult,
    groupController.putUser)

module.exports = router
