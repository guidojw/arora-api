'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const TrainingModel = require('../../../src/models/training')
const TrainingCancellationModel = require('../../../src/models/training-cancellation')
const TrainingTypeModel = require('../../../src/models/training-type')

describe('src/models/training', () => {
  const Training = TrainingModel(sequelize, dataTypes)
  const training = new Training()

  checkModelName(Training)('Training')

  context('properties', () => {
    ['authorId', 'date', 'groupId', 'notes'].forEach(checkPropertyExists(training))
  })

  context('associations', () => {
    const TrainingCancellation = TrainingCancellationModel(sequelize, dataTypes)
    const TrainingType = TrainingTypeModel(sequelize, dataTypes)

    before(() => {
      Training.associate({ TrainingCancellation, TrainingType })
    })

    it('defined a hasOne association with TrainingCancellation', () => {
      expect(Training.hasOne).to.have.been.calledWith(TrainingCancellation, {
        foreignKey: {
          allowNull: false,
          name: 'trainingId'
        }
      })
    })

    it('defined a belongsTo association with TrainingType', () => {
      expect(Training.belongsTo).to.have.been.calledWith(TrainingType, {
        foreignKey: 'typeId',
        as: 'type',
        onDelete: 'SET NULL'
      })
    })
  })
})
