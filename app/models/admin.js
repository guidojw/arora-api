'use strict'
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Admin', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {})
}
