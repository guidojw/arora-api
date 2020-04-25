'use strict'
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('suspensions', {
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
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'user_id'
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            rankBack: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                field: 'rank_back'
            },
            rank: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            finished: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        })
    },
    down: (queryInterface /* , Sequelize */) => {
        return queryInterface.dropTable('suspensions')
    }
}
