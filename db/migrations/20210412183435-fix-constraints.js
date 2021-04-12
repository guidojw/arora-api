'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        changeUserIdColumn(queryInterface, 'bans', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'bans', 'user_id', true, t),
        changeUserIdColumn(queryInterface, 'ban_cancellations', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'training_cancellations', 'author_id', true, t),
        changeUserIdColumn(queryInterface, 'trainings', 'author_id', true, t)
      ])

      return queryInterface.changeColumn('bans', 'date', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }, { transaction: t })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        changeUserIdColumn(queryInterface, 'bans', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'bans', 'user_id', false, t),
        changeUserIdColumn(queryInterface, 'ban_cancellations', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'training_cancellations', 'author_id', false, t),
        changeUserIdColumn(queryInterface, 'trainings', 'author_id', false, t)
      ])

      return queryInterface.changeColumn('bans', 'date', {
        type: Sequelize.DATE,
        allowNull: false
      }, { transaction: t })
    })
  }
}

async function changeUserIdColumn (queryInterface, tableName, columnName, up, transaction) {
  const attributes = await queryInterface.describeTable(tableName)
  return queryInterface.changeColumn(tableName, columnName, {
    type: attributes[columnName].type,
    allowNull: !up
  }, { transaction })
}
