'use strict'

module.exports = (sequelize, DataTypes) => {
  const SuspensionCancellation = sequelize.define('SuspensionCancellation', {
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
    tableName: 'suspension_cancellations'
  })

  SuspensionCancellation.associate = models => {
    SuspensionCancellation.belongsTo(models.Suspension, {
      foreignKey: {
        allowNull: false,
        name: 'suspensionId'
      },
      onDelete: 'cascade'
    })
  }

  return SuspensionCancellation
}
