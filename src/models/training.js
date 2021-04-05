'use strict'

const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Training = sequelize.define('Training', {
    authorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'author_id'
    },
    notes: {
      type: DataTypes.STRING
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    }
  }, {
    tableName: 'trainings'
  })

  Training.associate = models => {
    Training.hasOne(models.TrainingCancellation, {
      foreignKey: {
        allowNull: false,
        name: 'trainingId'
      }
    })
    Training.belongsTo(models.TrainingType, {
      foreignKey: 'typeId',
      as: 'type',
      onDelete: 'SET NULL'
    })
  }

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
