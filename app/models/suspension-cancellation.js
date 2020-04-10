'use strict'
module.exports = (sequelize, DataTypes) => {
  const SuspensionCancellation = sequelize.define('SuspensionCancellation', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {})

  SuspensionCancellation.associate = function(models) {

  }

  return SuspensionCancellation
}
