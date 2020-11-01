'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('suspension_extensions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'author_id'
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      suspensionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'suspensions',
          key: 'id'
        },
        field: 'suspension_id'
      }
    })
  },
  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.dropTable('suspension_extensions')
  }
}
