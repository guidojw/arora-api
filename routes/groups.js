const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group')
const validationResultController = require('../app/helpers/validation-result')

router.get('/:groupId/suspend/:userId', groupController.validate('suspend'), validationResultController
    .handleResult, groupController.suspend)

router.get('/:groupId/rank/:userId', groupController.validate('getRank'), validationResultController
    .handleResult, groupController.getRank)

module.exports = router
