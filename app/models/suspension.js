'use strict'
module.exports = (sequelize, DataTypes) => {
  const Suspension = sequelize.define('Suspension', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rankBack: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {})

  Suspension.associate = function(models) {

  }

  return Suspension
}
