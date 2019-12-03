const express = require('express')
const router = express.Router()

const groupController = require('../app/controllers/group.js')
const validationResultController = require('../app/controllers/validation-result.js')

//router.post('/:groupId/suspend/:userId', groupController.validate('suspend'), validationResultController
//     .handleResult, groupController.suspend)

module.exports = router
