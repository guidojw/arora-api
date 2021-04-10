'use strict'

module.exports = (sequelize, DataTypes) => {
  const Exile = sequelize.define('Exile', {
    authorId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'author_id'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    tableName: 'exiles'
  })

  return Exile
}
