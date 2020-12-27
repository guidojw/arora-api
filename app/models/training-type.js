'use strict'
module.exports = (sequelize, DataTypes) => {
  const TrainingType = sequelize.define('TrainingType', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    tableName: 'training_types'
  })

  TrainingType.associate = models => {
    TrainingType.hasOne(models.Training, {
      foreignKey: {
        allowNull: false,
        name: 'type'
      }
    })
  }

  return TrainingType
}
