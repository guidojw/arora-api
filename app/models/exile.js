'use strict'
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Exile', {
        userId: {
            type: DataTypes.STRING,
            field: 'user_id'
        }
    }, {
        tableName: 'exiles'
    })
}
