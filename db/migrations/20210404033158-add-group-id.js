'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        addGroupIdColumn(queryInterface, Sequelize, 'bans', t),
        addGroupIdColumn(queryInterface, Sequelize, 'exiles', t),
        addGroupIdColumn(queryInterface, Sequelize, 'payouts', t),
        addGroupIdColumn(queryInterface, Sequelize, 'suspensions', t),
        addGroupIdColumn(queryInterface, Sequelize, 'trainings', t),
        addGroupIdColumn(queryInterface, Sequelize, 'training_types', t)
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('bans', 'group_id', { transaction: t }),
        queryInterface.removeColumn('exiles', 'group_id', { transaction: t }),
        queryInterface.removeColumn('payouts', 'group_id', { transaction: t }),
        queryInterface.removeColumn('suspensions', 'group_id', { transaction: t }),
        queryInterface.removeColumn('trainings', 'group_id', { transaction: t }),
        queryInterface.removeColumn('training_types', 'group_id', { transaction: t })
      ])
    })
  }
}

async function addGroupIdColumn (queryInterface, Sequelize, tableName, transaction) {
  await queryInterface.addColumn(tableName, 'group_id', {
    type: Sequelize.INTEGER
  }, { transaction })
  await queryInterface.sequelize.query(`UPDATE ${tableName} SET group_id=1018818`, { transaction })
  return queryInterface.changeColumn(tableName, 'group_id', {
    type: Sequelize.INTEGER,
    allowNull: false
  }, { transaction })
}
