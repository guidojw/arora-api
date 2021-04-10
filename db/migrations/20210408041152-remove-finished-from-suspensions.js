'use strict'

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return queryInterface.removeColumn('suspensions', 'finished')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('suspensions', 'finished', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  }
}
