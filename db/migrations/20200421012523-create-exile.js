'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('exiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        field: 'user_id'
      }
    })
  },
  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.dropTable('exiles')
  }
}
