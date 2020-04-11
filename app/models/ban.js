'use strict'
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
  const Ban = sequelize.define('Ban', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    hooks: {
      afterCreate: ban => {

      },
      afterUpdate: ban => {

      }
    }
  })

  Ban.associate = models => {
      Ban.hasOne(models.BanCancellation, { foreignKey: { allowNull: false, name: 'banId' }})
  }

  return Ban
}
