'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const SuspensionModel = require('../../../src/models/suspension')
const SuspensionCancellationModel = require('../../../src/models/suspension-cancellation')
const SuspensionExtensionModel = require('../../../src/models/suspension-extension')

describe('src/models/suspension', () => {
  const Suspension = SuspensionModel(sequelize, dataTypes)
  const suspension = new Suspension()

  checkModelName(Suspension)('Suspension')

  context('properties', () => {
    [
      'authorId', 'date', 'duration', 'groupId', 'reason', 'roleBack', 'roleId', 'userId'
    ].forEach(checkPropertyExists(suspension))
  })

  context('associations', () => {
    const SuspensionCancellation = SuspensionCancellationModel(sequelize, dataTypes)
    const SuspensionExtension = SuspensionExtensionModel(sequelize, dataTypes)

    before(() => {
      Suspension.associate({ SuspensionCancellation, SuspensionExtension })
    })

    it('defined a hasOne association with SuspensionCancellation', () => {
      expect(Suspension.hasOne).to.have.been.calledWith(SuspensionCancellation, {
        foreignKey: {
          allowNull: false,
          name: 'suspensionId'
        }
      })
    })

    it('defined a hasMany association with SuspensionExtension', () => {
      expect(Suspension.hasMany).to.have.been.calledWith(SuspensionExtension, {
        foreignKey: {
          allowNull: false,
          name: 'suspensionId'
        },
        as: 'extensions'
      })
    })
  })
})
