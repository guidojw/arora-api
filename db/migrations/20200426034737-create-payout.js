'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('payouts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      until: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },
  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.dropTable('payouts')
  }
}
