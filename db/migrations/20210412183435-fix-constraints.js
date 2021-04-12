'use strict'

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(async t => {
      return Promise.all([
        changeUserIdColumn(queryInterface, 'bans', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'bans', 'user_id', true, t),
        changeUserIdColumn(queryInterface, 'ban_cancellations', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'training_cancellations', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'trainings', 'author_id', true, t)
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeUserIdColumn(queryInterface, 'bans', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'bans', 'user_id', false, t),
        changeUserIdColumn(queryInterface, 'ban_cancellations', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'training_cancellations', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'trainings', 'author_id', false, t)
      ])
    })
  }
}

async function changeUserIdColumn (queryInterface, tableName, columnName, up, transaction) {
  const attributes = await queryInterface.describeTable(tableName)
  const attribute = attributes[columnName]
  return queryInterface.changeColumn(tableName, columnName, {
    type: attribute.type,
    allowNull: !up
  }, { transaction })
}
