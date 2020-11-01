'use strict'
const express = require('express')

class BansRouter {
    constructor(banController, errorMiddleware, authMiddleware) {
        const handleValidationResult = errorMiddleware.handleValidationResult.bind(errorMiddleware)
        const authenticate = authMiddleware.authenticate.bind(authMiddleware)
        const router = express.Router()

        router.route('/')
            .get(
                banController.validate('getBans'),
                handleValidationResult,
                authenticate,
                banController.getBans.bind(banController)
            )
            .post(
                banController.validate('postBan'),
                handleValidationResult,
                authenticate,
                banController.postBan.bind(banController)
            )

        router.route('/:userId')
            .get(
                banController.validate('getBan'),
                handleValidationResult,
                authenticate,
                banController.getBan.bind(banController)
            )
            .put(
                banController.validate('putBan'),
                handleValidationResult,
                authenticate,
                banController.putBan.bind(banController)
            )

        router.post(
            '/:userId/cancel',
            banController.validate('cancelBan'),
            handleValidationResult,
            authenticate,
            banController.cancelBan.bind(banController)
        )

        return router
    }
}

module.exports = BansRouter
