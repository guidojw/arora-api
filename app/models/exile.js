'use strict'
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Exile', {
        userId: DataTypes.STRING,
    }, {})
}
