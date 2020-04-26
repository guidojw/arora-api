'use strict'
module.exports = (sequelize, DataTypes) => {
    const Payout = sequelize.define('Payout', {
        until: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'payouts'
    })

    Payout.getLast = async () => {
        return (await Payout.findAll({
            attributes: [[sequelize.fn('MAX', sequelize.col('until')), 'until']]
        }))[0]
    }

    return Payout
}
