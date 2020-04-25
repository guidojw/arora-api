'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('suspension_cancellations', {
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
        return queryInterface.dropTable('suspension_cancellations')
    }
}
