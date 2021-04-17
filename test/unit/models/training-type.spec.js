'use strict'

const { expect } = require('chai')
const {
  checkModelName,
  checkPropertyExists,
  dataTypes,
  sequelize
} = require('sequelize-test-helpers')

const TrainingTypeModel = require('../../../src/models/training-type')
const TrainingModel = require('../../../src/models/training')

describe('src/models/training-type', () => {
  const TrainingType = TrainingTypeModel(sequelize, dataTypes)
  const trainingType = new TrainingType()

  checkModelName(TrainingType)('TrainingType')

  context('properties', () => {
    ['abbreviation', 'groupId', 'name'].forEach(checkPropertyExists(trainingType))
  })

  context('associations', () => {
    const Training = TrainingModel(sequelize, dataTypes)

    before(() => {
      TrainingType.associate({ Training })
    })

    it('defined a hasMany association with Training', () => {
      expect(TrainingType.hasMany).to.have.been.calledWith(Training, {
        foreignKey: {
          allowNull: false,
          name: 'typeId'
        },
        as: 'type'
      })
    })
  })
})
