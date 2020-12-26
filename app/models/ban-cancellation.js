'use strict'
module.exports = (sequelize, DataTypes) => {
  const BanCancellation = sequelize.define('BanCancellation', {
    authorId: {
      type: DataTypes.BIGINT,
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
    tableName: 'ban_cancellations'
  })

  BanCancellation.associate = models => {
    BanCancellation.belongsTo(models.Ban, {
      foreignKey: { allowNull: false, name: 'banId' },
      onDelete: 'cascade'
    })
  }

  return BanCancellation
}
