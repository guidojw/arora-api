'use strict'

module.exports = (sequelize, DataTypes) => {
  const BanExtension = sequelize.define('BanExtension', {
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
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'ban_extensions'
  })

  BanExtension.associate = models => {
    BanExtension.belongsTo(models.Ban, {
      foreignKey: {
        allowNull: false,
        name: 'banId'
      },
      onDelete: 'CASCADE'
    })
  }

  return BanExtension
}
