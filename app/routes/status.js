'use strict'
const express = require('express')

class StatusRouter {
  constructor (statusController, errorMiddleware, authMiddleware) {
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const router = express.Router()

    router.get(
      '/:groupId',
      statusController.validate('getStatus'),
      handleValidationResult,
      authenticate,
      statusController.getStatus.bind(statusController)
    )

    return router
  }
}

module.exports = StatusRouter
