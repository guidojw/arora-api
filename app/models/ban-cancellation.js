'use strict'
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
  const BanCancellation = sequelize.define('BanCancellation', {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      afterCreate: ban => {

      }
    }
  })

  BanCancellation.associate = models => {
    BanCancellation.belongsTo(models.Ban, {
      foreignKey: { allowNull: false, name: 'banId' },
      onDelete: 'cascade',
      hooks: true
    })
  }

  return BanCancellation
}
