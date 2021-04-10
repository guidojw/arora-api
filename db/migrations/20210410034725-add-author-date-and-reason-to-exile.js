'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        addColumn(queryInterface, 'author_id', Sequelize.INTEGER, 6882179, t),
        addColumn(queryInterface, 'reason', Sequelize.STRING, '\'No reason\'', t),
        queryInterface.addColumn('exiles', 'date', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        }, { transaction: t }),
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('exiles', 'author_id', { transaction: t }),
        queryInterface.removeColumn('exiles', 'date', { transaction: t }),
        queryInterface.removeColumn('exiles', 'reason', { transaction: t })
      ])
    })
  }
}

async function addColumn (queryInterface, columnName, type, startValue, transaction) {
  await queryInterface.addColumn('exiles', columnName, {
    type
  }, { transaction })
  await queryInterface.sequelize.query(`UPDATE exiles SET ${columnName}=${startValue}`, { transaction })
  return queryInterface.changeColumn('exiles', columnName, {
    type,
    allowNull: false
  }, { transaction })
}
