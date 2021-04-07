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
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    }
  }, {
    tableName: 'training_types'
  })

  TrainingType.associate = models => {
    TrainingType.hasMany(models.Training, {
      foreignKey: {
        allowNull: false,
        name: 'typeId'
      },
      as: 'type'
    })
  }

  return TrainingType
}
