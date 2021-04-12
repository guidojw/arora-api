'use strict'

module.exports = (sequelize, DataTypes) => {
  const Ban = sequelize.define('Ban', {
    authorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'author_id'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    duration: DataTypes.INTEGER,
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    tableName: 'bans'
  })

  Ban.associate = models => {
    Ban.hasOne(models.BanCancellation, {
      foreignKey: {
        allowNull: false,
        name: 'banId'
      }
    })
    Ban.hasMany(models.BanExtension, {
      foreignKey: {
        allowNull: false,
        name: 'banId'
      },
      as: 'extensions'
    })
  }

  Ban.loadScopes = models => {
    const endsAtLiteral = sequelize.literal(
      'date + ' +
      '("Ban".duration||\' milliseconds\')::INTERVAL + ' +
      '(COALESCE(SUM(extensions.duration), 0)||\' milliseconds\')::INTERVAL'
    )
    const baseScope = {
      attributes: {
        include: [
          [endsAtLiteral, 'endsAt']
        ]
      },
      where: { '$BanCancellation.id$': null },
      include: [{
        model: models.BanCancellation,
        attributes: []
      }, {
        model: models.BanExtension,
        as: 'extensions'
      }],
      group: ['Ban.id', 'extensions.id'],
      subQuery: false
    }

    Ban.addScope('defaultScope', {
      ...baseScope,
      having: sequelize.literal(`"Ban".duration IS NULL OR ${endsAtLiteral.val} > NOW()`)
    })
    Ban.addScope('finished', {
      ...baseScope,
      having: sequelize.literal(`${endsAtLiteral.val} <= NOW()`)
    })
  }

  return Ban
}
