'use strict'
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Payout', {
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'payouts'
    })
}
