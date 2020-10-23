'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const announceTrainingsJob = require('../jobs/announce-trainings')
const cron = require('node-schedule')

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
                announceTrainingsJob.run(robloxConfig.defaultGroup)
                const job = cron.scheduledJobs[`training_${cancellation.trainingId}`]
                if (job) job.cancel()
                const authorName = await userService.getUsername(cancellation.authorId)
                discordMessageJob.run('log', `**${authorName}** cancelled training **${cancellation
                    .trainingId}** with reason "*${cancellation.reason}*"`)
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
