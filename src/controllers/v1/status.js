'use strict'

const { header, param } = require('express-validator')

class StatusController {
  constructor (statusService) {
    this._statusService = statusService
  }

  async getStatus (req, res) {
    res.json(await this._statusService.getStatus(req.params.groupId))
  }

  validate (method) {
    switch (method) {
      case 'getStatus':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]
    }
  }
}

module.exports = StatusController
