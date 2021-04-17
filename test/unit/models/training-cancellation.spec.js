'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const TrainingCancellationModel = require('../../../src/models/training-cancellation')
const TrainingModel = require('../../../src/models/training')

describe('src/models/training-cancellation', () => {
  const TrainingCancellation = TrainingCancellationModel(sequelize, dataTypes)
  const trainingCancellation = new TrainingCancellation()

  checkModelName(TrainingCancellation)('TrainingCancellation')

  context('properties', () => {
    ['authorId', 'reason'].forEach(checkPropertyExists(trainingCancellation))
  })

  context('associations', () => {
    const Training = TrainingModel(sequelize, dataTypes)

    before(() => {
      TrainingCancellation.associate({ Training })
    })

    it('defined a belongsTo association with Training', () => {
      expect(TrainingCancellation.belongsTo).to.have.been.calledWith(Training, {
        foreignKey: {
          allowNull: false,
          name: 'trainingId'
        },
        onDelete: 'CASCADE'
      })
    })
  })
})
