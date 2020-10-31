'use strict'
const express = require('express')

class BansRouter {
    constructor(banController, { handleValidationResult }, { authenticate }) {
        const router = express.Router()

        router.get('/', banController.validate('getBans'), handleValidationResult, authenticate, banController.getBans)
        router.get('/:userId', banController.validate('getBan'), handleValidationResult, authenticate, banController
            .getBan)

        router.post('/', banController.validate('ban'), handleValidationResult, authenticate, banController.ban)
        router.post('/:userId/cancel', banController.validate('cancelBan'), handleValidationResult, authenticate,
            banController.cancelBan)

        router.put('/:userId', banController.validate('putBan'), handleValidationResult, authenticate, banController
            .putBan)

        return router
    }
}

module.exports = BansRouter
