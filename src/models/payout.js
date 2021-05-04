'use strict'

module.exports = (sequelize, DataTypes) => {
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
