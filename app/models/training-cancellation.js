'use strict'
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: cancellation => {

            }
        }
    })

    TrainingCancellation.associate = models => {
        TrainingCancellation.belongsTo(models.Training, {
            foreignKey: { allowNull: false, name: 'trainingId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return TrainingCancellation
}
