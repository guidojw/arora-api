'use strict'
module.exports = (sequelize, DataTypes) => {
  const SuspensionExtension = sequelize.define('SuspensionExtension', {
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
    tableName: 'suspension_extensions'
  })

  SuspensionExtension.associate = models => {
    SuspensionExtension.belongsTo(models.Suspension, {
      foreignKey: {
        allowNull: false,
        name: 'suspensionId'
      },
      onDelete: 'cascade'
    })
  }

  return SuspensionExtension
}
