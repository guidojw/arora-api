'use strict'
module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return Promise.all([
      _changeColumn(queryInterface, 'bans', 'author_id', 'BIGINT'),
      _changeColumn(queryInterface, 'bans', 'user_id', 'BIGINT'),

      _changeColumn(queryInterface, 'ban_cancellations', 'author_id', 'BIGINT'),

      _changeColumn(queryInterface, 'exiles', 'user_id', 'BIGINT'),

      _changeColumn(queryInterface, 'suspensions', 'author_id', 'BIGINT'),
      _changeColumn(queryInterface, 'suspensions', 'user_id', 'BIGINT'),

      _changeColumn(queryInterface, 'suspension_cancellations', 'author_id', 'BIGINT'),

      _changeColumn(queryInterface, 'suspension_extensions', 'author_id', 'BIGINT'),

      _changeColumn(queryInterface, 'trainings', 'author_id', 'BIGINT'),

      _changeColumn(queryInterface, 'training_cancellations', 'author_id', 'BIGINT')
    ])
  },
  down: (queryInterface /* , Sequelize */) => {
    return Promise.all([
      _changeColumn(queryInterface, 'training_cancellations', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'trainings', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'suspension_extensions', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'suspension_cancellations', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'suspensions', 'user_id', 'INTEGER'),
      _changeColumn(queryInterface, 'suspensions', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'exiles', 'user_id', 'INTEGER'),

      _changeColumn(queryInterface, 'ban_cancellations', 'author_id', 'INTEGER'),

      _changeColumn(queryInterface, 'bans', 'user_id', 'INTEGER'),
      _changeColumn(queryInterface, 'bans', 'author_id', 'INTEGER')
    ])
  }
}

function _changeColumn(queryInterface, tableName, columnName, targetType) {
  return queryInterface.changeColumn(tableName, columnName, {
    type: `${targetType} USING CAST("${columnName}" as ${targetType})`
  })
}
