'use strict'

module.exports = (sequelize, DataTypes) => {
  const Suspension = sequelize.define('Suspension', {
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roleBack: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'role_back'
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    }
  }, {
    tableName: 'suspensions'
  })

  Suspension.associate = models => {
    Suspension.hasOne(models.SuspensionCancellation, {
      foreignKey: {
        allowNull: false,
        name: 'suspensionId'
      }
    })
    Suspension.hasMany(models.SuspensionExtension, {
      foreignKey: {
        allowNull: false,
        name: 'suspensionId'
      },
      as: 'extensions'
    })
  }

  Suspension.loadScopes = models => {
    const endsAtLiteral = sequelize.literal(
      'date + ' +
      '("Suspension".duration||\' milliseconds\')::INTERVAL + ' +
      '(COALESCE(SUM(extensions.duration), 0)||\' milliseconds\')::INTERVAL'
    )
    const baseScope = {
      attributes: {
        include: [
          [endsAtLiteral, 'endsAt']
        ]
      },
      where: { '$SuspensionCancellation.id$': null },
      include: [{
        model: models.SuspensionCancellation,
        attributes: []
      }, {
        model: models.SuspensionExtension,
        as: 'extensions'
      }],
      group: ['Suspension.id', 'extensions.id'],
      subQuery: false
    }

    Suspension.addScope('defaultScope', {
      ...baseScope,
      having: sequelize.literal(`${endsAtLiteral.val} > NOW()`)
    })
    Suspension.addScope('finished', {
      ...baseScope,
      having: sequelize.literal(`${endsAtLiteral.val} <= NOW()`)
    })
  }

  return Suspension
}
