'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const BanCancellationModel = require('../../../src/models/ban-cancellation')
const BanModel = require('../../../src/models/ban')

describe('src/models/ban-cancellation', () => {
  const BanCancellation = BanCancellationModel(sequelize, dataTypes)
  const banCancellation = new BanCancellation()

  checkModelName(BanCancellation)('BanCancellation')

  context('properties', () => {
    ['authorId', 'reason'].forEach(checkPropertyExists(banCancellation))
  })

  context('associations', () => {
    const Ban = BanModel(sequelize, dataTypes)

    before(() => {
      BanCancellation.associate({ Ban })
    })

    it('defined a belongsTo association with Ban', () => {
      expect(BanCancellation.belongsTo).to.have.been.calledWith(Ban, {
        foreignKey: {
          allowNull: false,
          name: 'banId'
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
