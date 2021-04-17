'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const BanExtensionModel = require('../../../src/models/ban-extension')
const BanModel = require('../../../src/models/ban')

describe('src/models/ban-extension', () => {
  const BanExtension = BanExtensionModel(sequelize, dataTypes)
  const banExtension = new BanExtension()

  checkModelName(BanExtension)('BanExtension')

  context('properties', () => {
    ['authorId', 'duration', 'reason'].forEach(checkPropertyExists(banExtension))
  })

  context('associations', () => {
    const Ban = BanModel(sequelize, dataTypes)

    before(() => {
      BanExtension.associate({ Ban })
    })

    it('defined a belongsTo association with Ban', () => {
      expect(BanExtension.belongsTo).to.have.been.calledWith(Ban, {
        foreignKey: {
          allowNull: false,
          name: 'banId'
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
