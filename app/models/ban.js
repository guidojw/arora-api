'use strict'
module.exports = (sequelize, DataTypes) => {
  const Ban = sequelize.define('Ban', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
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
  }, {})

  Ban.associate = models => {
      Ban.hasOne(models.BanCancellation, { foreignKey: { allowNull: false, name: 'banId' }})
  }

  Ban.loadScopes = models => {
    Ban.addScope('defaultScope', {
      where: { '$BanCancellation.id$': null },
      include: [{
        model: models.BanCancellation,
        attributes: []
      }]
    })
  }

  return Ban
}
