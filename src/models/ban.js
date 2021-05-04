'use strict'

module.exports = (sequelize, DataTypes) => {
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
