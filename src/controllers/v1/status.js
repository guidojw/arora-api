'use strict'

const { header, param } = require('express-validator')

class StatusController {
  constructor (statusService) {
    this._statusService = statusService
  }

  getStatus (req, res) {
    res.json(this._statusService.getStatus())
  }

  async getGroupClientStatus (req, res) {
    res.json(await this._statusService.getGroupClientStatus(req.params.groupId))
  }

  validate (method) {
    switch (method) {
      case 'getStatus':
        return [
          header('authorization').exists().isString()
        ]
      case 'getGroupClientStatus':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]
    }
  }
}

module.exports = StatusController
