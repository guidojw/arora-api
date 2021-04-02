'use strict'

const { param, body, header, query } = require('express-validator')
const { decodeScopeQueryParam, decodeSortQueryParam } = require('../../helpers').requestHelper

class BanController {
  constructor (banService) {
    this._banService = banService
  }

  async getBans (req, res) {
    res.json((await this._banService.getBans(req.query.scope, req.query.sort))
      .map(ban => ban.get({ plain: true })))
  }

  async getBan (req, res) {
    res.json((await this._banService.getBan(req.params.userId, req.query.scope))
      .get({ plain: true }))
  }

  async postBan (req, res) {
    res.json((await this._banService.ban(req.body.groupId, req.body.userId, req.body))
      .get({ raw: true }))
  }

  async cancelBan (req, res) {
    res.json((await this._banService.cancelBan(req.params.userId, req.body.authorId, req.body.reason))
      .get({ raw: true }))
  }

  async putBan (req, res) {
    res.json((await this._banService.changeBan(req.params.userId, req.body))
      .get({ plain: true }))
  }

  validate (method) {
    switch (method) {
      case 'getBans':
        return [
          header('authorization').exists().isString(),
          query('scope').customSanitizer(decodeScopeQueryParam),
          query('sort').customSanitizer(decodeSortQueryParam)
        ]
      case 'getBan':
        return [
          header('authorization').exists().isString(),
          param('userId').exists().isInt().toInt(),
          query('scope').customSanitizer(decodeScopeQueryParam)
        ]

      case 'postBan':
        return [
          header('authorization').exists().isString(),
          body('userId').exists().isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString(),
          body('groupId').exists().isInt().toInt()
        ]
      case 'cancelBan':
        return [
          header('authorization').exists().isString(),
          param('userId').exists().isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString()
        ]

      case 'putBan':
        return [
          header('authorization').exists().isString(),
          param('userId').exists().isInt().toInt(),
          body('editorId').exists().isInt().toInt(),
          body('changes.authorId').optional().isInt().toInt(),
          body('changes.reason').optional().isString()
        ]
    }
  }
}

module.exports = BanController
