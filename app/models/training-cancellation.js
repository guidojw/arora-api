'use strict'
module.exports = (sequelize, DataTypes) => {
  const TrainingCancellation = sequelize.define('TrainingCancellation', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {})

  TrainingCancellation.associate = function(models) {

  }

  return TrainingCancellation
}
