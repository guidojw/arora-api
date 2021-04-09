'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const SuspensionExtensionModel = require('../../../src/models/suspension-extension')
const SuspensionModel = require('../../../src/models/suspension')

describe('src/models/suspension-extension', () => {
  const SuspensionExtension = SuspensionExtensionModel(sequelize, dataTypes)
  const suspensionExtension = new SuspensionExtension()

  checkModelName(SuspensionExtension)('SuspensionExtension')

  context('properties', () => {
    ['authorId', 'duration', 'reason'].forEach(checkPropertyExists(suspensionExtension))
  })

  context('associations', () => {
    const Suspension = SuspensionModel(sequelize, dataTypes)

    before(() => {
      SuspensionExtension.associate({ Suspension })
    })

    it('defined a belongsTo association with Suspension', () => {
      expect(SuspensionExtension.belongsTo).to.have.been.calledWith(Suspension, {
        foreignKey: {
          allowNull: false,
          name: 'suspensionId'
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
