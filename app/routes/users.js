'use strict'
const express = require('express')

class UsersRouter {
    constructor(userController, { handleValidationResult }, { authenticate }) {
        const router = express.Router()

        router.get('/:username/user-id', userController.validate('getUserIdFromUsername'), handleValidationResult,
            authenticate, userController.getUserIdFromUsername)
        router.get('/:userId/has-badge/:badgeId', userController.validate('hasBadge'), handleValidationResult,
            authenticate, userController.hasBadge)
        router.get('/:userId/rank/:groupId', userController.validate('getRank'), handleValidationResult, authenticate,
            userController.getRank)
        router.get('/:userId/role/:groupId', userController.validate('getRole'), handleValidationResult, authenticate,
            userController.getRole)
        router.get('/:userId', userController.validate('getUser'), handleValidationResult, authenticate, userController
            .getUser)

        router.post('/', userController.validate('getUsers'), handleValidationResult, authenticate, userController
            .getUsers)

        return router
    }
}

module.exports = UsersRouter
