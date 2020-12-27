'use strict'
module.exports = (sequelize, DataTypes) => {
  const TrainingType = sequelize.define('TrainingType', {
    name: {
      type: DataTypes.STRING,
      primaryKey: false,
      validate: {
        notEmpty: true
      }
    },
    abbreviation: {
      type: DataTypes.STRING(8),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'training_types'
  })

  TrainingType.associate = models => {
    TrainingType.hasOne(models.Training, {
      foreignKey: {
        allowNull: false,
        name: 'typeId'
      },
      as: 'type'
    })
  }

  return TrainingType
}
