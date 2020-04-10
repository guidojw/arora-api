'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Trainings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            authorId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            notes: {
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.ENUM,
                allowNull: false,
                values: ['cd', 'csr']
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false
            }
        })
    },
    down: (queryInterface /* , Sequelize */) => {
        return queryInterface.dropTable('Trainings')
    }
}
