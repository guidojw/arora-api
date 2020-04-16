'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('BanCancellations', {
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
            reason: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            }
        })
    },
    down: (queryInterface /* , Sequelize */) => {
        return queryInterface.dropTable('BanCancellations')
    }
}
