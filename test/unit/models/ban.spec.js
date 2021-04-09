'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const BanModel = require('../../../src/models/ban')
const BanCancellationModel = require('../../../src/models/ban-cancellation')

describe('src/models/ban', () => {
  const Ban = BanModel(sequelize, dataTypes)
  const ban = new Ban()

  checkModelName(Ban)('Ban')

  context('properties', () => {
    ['authorId', 'date', 'groupId', 'rank', 'reason', 'userId'].forEach(checkPropertyExists(ban))
  })

  context('associations', () => {
    const BanCancellation = BanCancellationModel(sequelize, dataTypes)

    before(() => {
      Ban.associate({ BanCancellation })
    })

    it('defined a hasOne association with BanCancellation', () => {
      expect(Ban.hasOne).to.have.been.calledWith(BanCancellation, {
        foreignKey: {
          allowNull: false,
          name: 'banId'
        }
      })
    })
  })
})
