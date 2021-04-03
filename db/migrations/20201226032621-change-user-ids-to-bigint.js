'use strict'

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return Promise.all([
      changeColumnType(queryInterface, 'bans', 'author_id', 'BIGINT'),
      changeColumnType(queryInterface, 'bans', 'user_id', 'BIGINT'),

      changeColumnType(queryInterface, 'ban_cancellations', 'author_id', 'BIGINT'),

      changeColumnType(queryInterface, 'exiles', 'user_id', 'BIGINT'),

      changeColumnType(queryInterface, 'suspensions', 'author_id', 'BIGINT'),
      changeColumnType(queryInterface, 'suspensions', 'user_id', 'BIGINT'),

      changeColumnType(queryInterface, 'suspension_cancellations', 'author_id', 'BIGINT'),

      changeColumnType(queryInterface, 'suspension_extensions', 'author_id', 'BIGINT'),

      changeColumnType(queryInterface, 'trainings', 'author_id', 'BIGINT'),

      changeColumnType(queryInterface, 'training_cancellations', 'author_id', 'BIGINT')
    ])
  },

  down: (queryInterface /* , Sequelize */) => {
    return Promise.all([
      changeColumnType(queryInterface, 'training_cancellations', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'trainings', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'suspension_extensions', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'suspension_cancellations', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'suspensions', 'user_id', 'INTEGER'),
      changeColumnType(queryInterface, 'suspensions', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'exiles', 'user_id', 'INTEGER'),

      changeColumnType(queryInterface, 'ban_cancellations', 'author_id', 'INTEGER'),

      changeColumnType(queryInterface, 'bans', 'user_id', 'INTEGER'),
      changeColumnType(queryInterface, 'bans', 'author_id', 'INTEGER')
    ])
  }
}

function changeColumnType (queryInterface, tableName, columnName, targetType) {
  return queryInterface.changeColumn(tableName, columnName, {
    type: `${targetType} USING CAST("${columnName}" as ${targetType})`
  })
}
