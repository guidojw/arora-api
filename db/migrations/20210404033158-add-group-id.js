'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      addGroupIdColumn(queryInterface, Sequelize, 'bans'),
      addGroupIdColumn(queryInterface, Sequelize, 'exiles'),
      addGroupIdColumn(queryInterface, Sequelize, 'payouts'),
      addGroupIdColumn(queryInterface, Sequelize, 'suspensions'),
      addGroupIdColumn(queryInterface, Sequelize, 'trainings'),
      addGroupIdColumn(queryInterface, Sequelize, 'training_types')
    ])
  },

  down: async (queryInterface /* , Sequelize */) => {
    await Promise.all([
      queryInterface.removeColumn('bans', 'group_id'),
      queryInterface.removeColumn('exiles', 'group_id'),
      queryInterface.removeColumn('payouts', 'group_id'),
      queryInterface.removeColumn('suspensions', 'group_id'),
      queryInterface.removeColumn('trainings', 'group_id'),
      queryInterface.removeColumn('training_types', 'group_id')
    ])
  }
}

async function addGroupIdColumn (queryInterface, Sequelize, tableName) {
  await queryInterface.addColumn(tableName, 'group_id', {
    type: Sequelize.INTEGER
  })
  await queryInterface.sequelize.query(`UPDATE ${tableName} SET group_id=1018818`)
  return queryInterface.changeColumn(tableName, 'group_id', {
    type: Sequelize.INTEGER,
    allowNull: false
  })
}
