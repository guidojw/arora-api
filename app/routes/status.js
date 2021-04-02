'use strict'

const express = require('express')

class StatusRouter {
  constructor (authMiddleware, errorMiddleware, statusController) {
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
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
