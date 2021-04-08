'use strict'

module.exports = (sequelize, DataTypes) => {
  const Payout = sequelize.define('Payout', {
    until: {
      type: DataTypes.DATE,
      allowNull: false
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    }
  }, {
    tableName: 'payouts'
  })

  Payout.getLast = async (groupId) => {
    return (await Payout.findAll({
      where: { groupId },
      attributes: [
        [sequelize.fn('MAX', sequelize.col('until')), 'until']
      ]
    }))[0]
  }

  return Payout
}
