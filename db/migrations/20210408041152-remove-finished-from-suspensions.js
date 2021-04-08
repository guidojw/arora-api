'use strict'

module.exports = {
  up: async (queryInterface /* , Sequelize */) => {
    await queryInterface.removeColumn('suspensions', 'finished')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('suspensions', 'finished', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  }
}
