'use strict'
module.exports = (sequelize, DataTypes) => {
  const Exile = sequelize.define('Exile', {
    userId: {
      type: DataTypes.STRING,
      field: 'user_id'
    }
  }, {
    tableName: 'exiles'
  })

  return Exile
}
