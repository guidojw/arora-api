const express = require('express')
const router = express.Router()

const userController = require('../app/controllers/user.js')
const validationResultController = require('../app/controllers/validation-result.js')

router.get('/:userId/rank/:groupId', userController.validate('getRank'), validationResultController
    .handleResult, userController.getRank)

module.exports = router
