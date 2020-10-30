'use strict'
const express = require('express')

class StatusRouter {
    constructor(statusController, { handleValidationResult }, { authenticate }) {
        const router = express.Router()

        router.get('/:groupId', statusController.validate('getStatus'), handleValidationResult, authenticate,
            statusController.getStatus)

        return router
    }
}

module.exports = StatusRouter
