'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const announceTrainingsJob = require('../jobs/announce-trainings')

const robloxConfig = require('../../config/roblox')

module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'author_id'
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
                announceTrainingsJob(robloxConfig.defaultGroup)
            }
        },
        tableName: 'training_cancellations'
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
