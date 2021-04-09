'use strict'

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeColumnType(queryInterface, 'bans', 'author_id', 'BIGINT', t),
        changeColumnType(queryInterface, 'bans', 'user_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'ban_cancellations', 'author_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'exiles', 'user_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'suspensions', 'author_id', 'BIGINT', t),
        changeColumnType(queryInterface, 'suspensions', 'user_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'suspension_cancellations', 'author_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'suspension_extensions', 'author_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'trainings', 'author_id', 'BIGINT', t),

        changeColumnType(queryInterface, 'training_cancellations', 'author_id', 'BIGINT', t)
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeColumnType(queryInterface, 'training_cancellations', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'trainings', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'suspension_extensions', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'suspension_cancellations', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'suspensions', 'user_id', 'INTEGER', t),
        changeColumnType(queryInterface, 'suspensions', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'exiles', 'user_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'ban_cancellations', 'author_id', 'INTEGER', t),

        changeColumnType(queryInterface, 'bans', 'user_id', 'INTEGER', t),
        changeColumnType(queryInterface, 'bans', 'author_id', 'INTEGER', t)
      ])
    })
  }
}

function changeColumnType (queryInterface, tableName, columnName, targetType, transaction) {
  return queryInterface.changeColumn(tableName, columnName, {
    type: `${targetType} USING CAST("${columnName}" as ${targetType})`
  }, { transaction })
}
