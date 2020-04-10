'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Bans', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            reason: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rank: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            authorId: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        })
    },
    down: (queryInterface /* , Sequelize */) => {
        return queryInterface.dropTable('Bans')
    }
}
