'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ban_cancellations', {
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
      banId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bans',
          key: 'id'
        },
        field: 'ban_id'
      }
    })
  },
  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.dropTable('ban_cancellations')
  }
}
