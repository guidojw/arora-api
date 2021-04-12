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
const BanExtensionModel = require('../../../src/models/ban-extension')

describe('src/models/ban', () => {
  const Ban = BanModel(sequelize, dataTypes)
  const ban = new Ban()

  checkModelName(Ban)('Ban')

  context('properties', () => {
    ['authorId', 'date', 'duration', 'groupId', 'reason', 'roleId', 'userId'].forEach(checkPropertyExists(ban))
  })

  context('associations', () => {
    const BanCancellation = BanCancellationModel(sequelize, dataTypes)
    const BanExtension = BanExtensionModel(sequelize, dataTypes)

    before(() => {
      Ban.associate({ BanCancellation, BanExtension })
    })

    it('defined a hasOne association with BanCancellation', () => {
      expect(Ban.hasOne).to.have.been.calledWith(BanCancellation, {
        foreignKey: {
          allowNull: false,
          name: 'banId'
        }
      })
    })

    it('defined a hasMany association with BanExtension', () => {
      expect(Ban.hasMany).to.have.been.calledWith(BanExtension, {
        foreignKey: {
          allowNull: false,
          name: 'banId'
        },
        as: 'extensions'
      })
    })
  })
})
