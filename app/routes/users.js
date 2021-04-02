'use strict'

const express = require('express')

class UsersRouter {
  constructor (authMiddleware, userController, errorMiddleware) {
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
    const router = express.Router()

    router.get(
      '/:username/user-id',
      userController.validate('getUserIdFromUsername'),
      handleValidationResult,
      authenticate,
      userController.getUserIdFromUsername.bind(userController)
    )
    router.get(
      '/:userId/has-badge/:badgeId',
      userController.validate('hasBadge'),
      handleValidationResult,
      authenticate,
      userController.hasBadge.bind(userController)
    )
    router.get(
      '/:userId/rank/:groupId',
      userController.validate('getRank'),
      handleValidationResult,
      authenticate,
      userController.getRank.bind(userController)
    )
    router.get(
      '/:userId/role/:groupId',
      userController.validate('getRole'),
      handleValidationResult,
      authenticate,
      userController.getRole.bind(userController)
    )
    router.get(
      '/:userId',
      userController.validate('getUser'),
      handleValidationResult,
      authenticate,
      userController.getUser.bind(userController)
    )

    router.post(
      '/',
      userController.validate('getUsers'),
      handleValidationResult,
      authenticate,
      userController.getUsers.bind(userController)
    )

    return router
  }
}

module.exports = UsersRouter
