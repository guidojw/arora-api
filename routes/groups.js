const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group')

const authenticator = require('../app/controllers/authenticator')
const { handleValidationResult } = require('../app/helpers/error')

router.post('/:groupId/suspend/:userId', authenticator.authenticate, groupController.validate('suspend'),
    handleValidationResult, groupController.suspend)

router.get('/:groupId/rank/:userId', authenticator.authenticate, groupController.validate('getRank'),
    handleValidationResult, groupController.getRank)

router.post('/:groupId/promote/:userId', authenticator.authenticate, groupController.validate('promote'),
    handleValidationResult, groupController.promote)

module.exports = router
