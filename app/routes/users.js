'use strict'
const express = require('express')
const router = express.Router()
const userController = require('../controllers/v1/user')
const { handleValidationResult } = require('../middlewares/error')

router.get('/:username/user-id', userController.validate('getUserId'), handleValidationResult, userController
    .getUserId)

router.get('/:userId/has-badge/:badgeId', userController.validate('hasBadge'), handleValidationResult,
    userController.hasBadge)

router.post('/', userController.validate('getUsers'), handleValidationResult, userController.getUsers)

router.get('/:userId/rank/:groupId', userController.validate('getRank'), handleValidationResult, userController
    .getRank)

router.get('/:userId/role/:groupId', userController.validate('getRole'), handleValidationResult, userController
    .getRole)

router.get('/:userId', userController.validate('getUser'), handleValidationResult, userController.getUser)

module.exports = router
