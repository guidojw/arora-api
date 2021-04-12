'use strict'

const express = require('express')

class GroupsRouter {
  constructor (authMiddleware, errorMiddleware, groupController) {
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
    const router = express.Router()

    // GroupService
    router.route('/:groupId/shout')
      .get(
        groupController.validate('getShout'),
        handleValidationResult,
        authenticate,
        groupController.getShout.bind(groupController)
      )
      .post(
        groupController.validate('postShout'),
        handleValidationResult,
        authenticate,
        groupController.postShout.bind(groupController)
      )

    router.get(
      '/:groupId/roles',
      groupController.validate('getRoles'),
      handleValidationResult,
      authenticate,
      groupController.getRoles.bind(groupController)
    )
    router.get(
      '/:groupId',
      groupController.validate('getGroup'),
      handleValidationResult,
      authenticate,
      groupController.getGroup.bind(groupController)
    )

    router.post(
      '/:groupId/users/:userId/promote',
      groupController.validate('promoteMember'),
      handleValidationResult,
      authenticate,
      groupController.promoteMember.bind(groupController)
    )
    router.post(
      '/:groupId/users/:userId/demote',
      groupController.validate('demoteMember'),
      handleValidationResult,
      authenticate,
      groupController.demoteMember.bind(groupController)
    )

    router.put(
      '/:groupId/users/:userId',
      groupController.validate('changeMemberRole'),
      handleValidationResult,
      authenticate,
      groupController.changeMemberRole.bind(groupController)
    )

    // BanService
    router.route('/:groupId/bans')
      .get(
        groupController.validate('getBans'),
        handleValidationResult,
        authenticate,
        groupController.getBans.bind(groupController)
      )
      .post(
        groupController.validate('postBan'),
        handleValidationResult,
        authenticate,
        groupController.postBan.bind(groupController)
      )

    router.route('/:groupId/bans/:userId')
      .get(
        groupController.validate('getBan'),
        handleValidationResult,
        authenticate,
        groupController.getBan.bind(groupController)
      )
      .put(
        groupController.validate('putBan'),
        handleValidationResult,
        authenticate,
        groupController.putBan.bind(groupController)
      )

    router.post(
      '/:groupId/bans/:userId/cancel',
      groupController.validate('cancelBan'),
      handleValidationResult,
      authenticate,
      groupController.cancelBan.bind(groupController)
    )
    router.post(
      '/:groupId/bans/:userId/extend',
      groupController.validate('extendBan'),
      handleValidationResult,
      authenticate,
      groupController.extendBan.bind(groupController)
    )

    // ExileService
    router.route('/:groupId/exiles')
      .get(
        groupController.validate('getExiles'),
        handleValidationResult,
        authenticate,
        groupController.getExiles.bind(groupController)
      )
      .post(
        groupController.validate('postExile'),
        handleValidationResult,
        authenticate,
        groupController.postExile.bind(groupController)
      )

    router.route('/:groupId/exiles/:userId')
      .get(
        groupController.validate('getExile'),
        handleValidationResult,
        authenticate,
        groupController.getExile.bind(groupController)
      )
      .delete(
        groupController.validate('deleteExile'),
        handleValidationResult,
        authenticate,
        groupController.deleteExile.bind(groupController)
      )

    // TrainingService
    router.route('/:groupId/trainings')
      .get(
        groupController.validate('getTrainings'),
        handleValidationResult,
        authenticate,
        groupController.getTrainings.bind(groupController)
      )
      .post(
        groupController.validate('postTraining'),
        handleValidationResult,
        authenticate,
        groupController.postTraining.bind(groupController)
      )

    router.route('/:groupId/trainings/types')
      .get(
        groupController.validate('getTrainingTypes'),
        handleValidationResult,
        authenticate,
        groupController.getTrainingTypes.bind(groupController)
      )
      .post(
        groupController.validate('postTrainingType'),
        handleValidationResult,
        authenticate,
        groupController.postTrainingType.bind(groupController)
      )

    router.route('/:groupId/trainings/types/:typeId')
      .put(
        groupController.validate('putTrainingType'),
        handleValidationResult,
        authenticate,
        groupController.putTrainingType.bind(groupController)
      )
      .delete(
        groupController.validate('deleteTrainingType'),
        handleValidationResult,
        authenticate,
        groupController.deleteTrainingType.bind(groupController)
      )

    router.route('/:groupId/trainings/:trainingId')
      .get(
        groupController.validate('getTraining'),
        handleValidationResult,
        authenticate,
        groupController.getTraining.bind(groupController)
      )
      .put(
        groupController.validate('putTraining'),
        handleValidationResult,
        authenticate,
        groupController.putTraining.bind(groupController)
      )

    router.post(
      '/:groupId/trainings/:trainingId/cancel',
      groupController.validate('cancelTraining'),
      handleValidationResult,
      authenticate,
      groupController.cancelTraining.bind(groupController)
    )

    return router
  }
}

module.exports = GroupsRouter
