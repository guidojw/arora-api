'use strict'

const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  Training.loadScopes = models => {
    Training.addScope('defaultScope', {
      where: {
        '$TrainingCancellation.id$': null,
        date: { [Op.gt]: sequelize.literal('NOW() - INTERVAL \'15 minutes\'') }
      },
      include: [{
        model: models.TrainingCancellation,
        attributes: []
      }, {
        model: models.TrainingType,
        as: 'type'
      }]
    })
  }

  return Training
}
