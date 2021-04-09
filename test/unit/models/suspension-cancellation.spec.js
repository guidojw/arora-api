'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const SuspensionCancellationModel = require('../../../src/models/suspension-cancellation')
const SuspensionModel = require('../../../src/models/suspension')

describe('src/models/suspension-cancellation', () => {
  const SuspensionCancellation = SuspensionCancellationModel(sequelize, dataTypes)
  const suspensionCancellation = new SuspensionCancellation()

  checkModelName(SuspensionCancellation)('SuspensionCancellation')

  context('properties', () => {
    ['authorId', 'reason'].forEach(checkPropertyExists(suspensionCancellation))
  })

  context('associations', () => {
    const Suspension = SuspensionModel(sequelize, dataTypes)

    before(() => {
      SuspensionCancellation.associate({ Suspension })
    })

    it('defined a belongsTo association with Suspension', () => {
      expect(SuspensionCancellation.belongsTo).to.have.been.calledWith(Suspension, {
        foreignKey: {
          allowNull: false,
          name: 'suspensionId'
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
