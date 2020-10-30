'use strict'
const express = require('express')

class GroupsRouter {
    constructor(groupController, { handleValidationResult }, { authenticate }) {
        const router = express.Router()

        // GroupService
        router.get('/:groupId/shout', groupController.validate('getShout'), handleValidationResult, authenticate,
            groupController.getShout)
        router.get('/:groupId/exiles', groupController.validate('getExiles'), handleValidationResult, authenticate,
            groupController.getExiles)
        router.get('/:groupId', groupController.validate('getGroup'), handleValidationResult, authenticate,
            groupController.getGroup)

        router.put('/:groupId/users/:userId', groupController.validate('putUser'), handleValidationResult, authenticate,
            groupController.putUser)

        // SuspensionService
        router.get('/:groupId/suspensions', groupController.validate('getSuspensions'), handleValidationResult,
            authenticate, groupController.getSuspensions)
        router.get('/:groupId/suspensions/:userId', groupController.validate('getSuspension'), handleValidationResult,
            authenticate, groupController.getSuspension)

        router.post('/:groupId/suspensions', groupController.validate('postSuspension'), handleValidationResult,
            authenticate, groupController.postSuspension)
        router.post('/:groupId/shout', groupController.validate('postShout'), handleValidationResult, authenticate,
            groupController.postShout)
        router.post('/:groupId/suspensions/:userId/cancel', groupController.validate('cancelSuspension'),
            handleValidationResult, authenticate, groupController.cancelSuspension)
        router.post('/:groupId/suspensions/:userId/extend', groupController.validate('extendSuspension'),
            handleValidationResult, authenticate, groupController.extendSuspension)

        router.put('/:groupId/suspensions/:userId', groupController.validate('putSuspension'), handleValidationResult,
            authenticate, groupController.putSuspension)

        // TrainingService
        router.get('/:groupId/trainings', groupController.validate('getTrainings'), handleValidationResult,
            authenticate, groupController.getTrainings)
        router.get('/:groupId/trainings/:trainingId', groupController.validate('getTraining'), handleValidationResult,
            authenticate, groupController.getTraining)

        router.post('/:groupId/trainings', groupController.validate('postTraining'), handleValidationResult,
            authenticate, groupController.postTraining)
        router.post('/:groupId/trainings/:trainingId/cancel', groupController.validate('cancelTraining'),
            handleValidationResult, authenticate, groupController.cancelTraining)

        router.put('/:groupId/trainings/:trainingId', groupController.validate('putTraining'), handleValidationResult,
            authenticate, groupController.putTraining)

        return router
    }
}

module.exports = GroupsRouter
