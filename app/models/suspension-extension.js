'use strict'
module.exports = (sequelize, DataTypes) => {
  const SuspensionExtension = sequelize.define('SuspensionExtension', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {})

  SuspensionExtension.associate = function(models) {

  }

  return SuspensionExtension
}
