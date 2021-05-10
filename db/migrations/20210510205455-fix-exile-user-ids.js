'use strict'

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeUserIdColumn(queryInterface, 'exiles', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'exiles', 'user_id', true, t)
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeUserIdColumn(queryInterface, 'exiles', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'exiles', 'user_id', false, t)
      ])
    })
  }
}

function changeUserIdColumn (queryInterface, tableName, columnName, up, transaction) {
  return queryInterface.changeColumn(tableName, columnName, {
    type: up ? 'BIGINT' : 'INT',
    allowNull: false
  }, { transaction })
}
