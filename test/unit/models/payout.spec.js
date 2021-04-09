'use strict'

const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const PayoutModel = require('../../../src/models/payout')

describe('src/models/payout', () => {
  const Payout = PayoutModel(sequelize, dataTypes)
  const payout = new Payout()

  checkModelName(Payout)('Payout')

  context('properties', () => {
    ['groupId', 'until'].forEach(checkPropertyExists(payout))
  })
})
