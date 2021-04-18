'use strict'

const express = require('express')

class StatusRouter {
  constructor (authMiddleware, errorMiddleware, statusController) {
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
    const router = express.Router()

    router.get(
      '/',
      statusController.validate('getStatus'),
      handleValidationResult,
      authenticate,
      statusController.getStatus.bind(statusController)
    )
    router.get(
      '/:groupId',
      statusController.validate('getGroupClientStatus'),
      handleValidationResult,
      authenticate,
      statusController.getGroupClientStatus.bind(statusController)
    )

    return router
  }
}

module.exports = StatusRouter
