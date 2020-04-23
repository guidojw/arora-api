'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        hooks: {
            afterCreate: async cancellation => {
                const authorName = await userService.getUsername(cancellation.authorId)
                discordMessageJob('log', `**${authorName}** cancelled training **${cancellation
                    .trainingId}** with reason "*${cancellation.reason}*"`)
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
