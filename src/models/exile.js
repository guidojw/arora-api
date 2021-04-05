'use strict'

module.exports = (sequelize, DataTypes) => {
  const Exile = sequelize.define('Exile', {
    userId: {
      type: DataTypes.BIGINT,
      field: 'user_id'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    }
  }, {
    tableName: 'exiles'
  })

  return Exile
}
