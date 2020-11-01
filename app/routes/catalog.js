'use strict'
const express = require('express')

class CatalogRouter {
  constructor (catalogController, errorMiddleware, authMiddleware) {
    const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
    const authenticate = authMiddleware.authenticate.bind(authMiddleware)
    const router = express.Router()

    router.get(
      '/',
      catalogController.validate('getItems'),
      handleValidationResult,
      authenticate,
      catalogController.getItems.bind(catalogController)
    )

    return router
  }
}

module.exports = CatalogRouter
