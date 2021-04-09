'use strict'

const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const ExileModel = require('../../../src/models/exile')

describe('src/models/exile', () => {
  const Exile = ExileModel(sequelize, dataTypes)
  const exile = new Exile()

  checkModelName(Exile)('Exile')

  context('properties', () => {
    ['groupId', 'userId'].forEach(checkPropertyExists(exile))
  })
})
