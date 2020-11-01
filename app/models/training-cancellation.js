'use strict'
module.exports = (sequelize, DataTypes) => {
  const TrainingCancellation = sequelize.define('TrainingCancellation', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'author_id'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'training_cancellations'
  })

  TrainingCancellation.associate = models => {
    TrainingCancellation.belongsTo(models.Training, {
      foreignKey: {
        allowNull: false,
        name: 'trainingId'
      },
      onDelete: 'cascade'
    })
  }

  return TrainingCancellation
}
