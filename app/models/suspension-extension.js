'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const pluralize = require('pluralize')
const cron = require('node-schedule')
const finishSuspensionJob = require('../jobs/finish-suspension')

module.exports = (sequelize, DataTypes) => {
    const SuspensionExtension = sequelize.define('SuspensionExtension', {
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
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: async extension => {
                const suspension = await sequelize.models.Suspension.findByPk(extension.suspensionId)
                const job = cron.scheduledJobs[`suspension_${suspension.id}`]
                if (job) job.cancel()
                cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.run
                    .bind(null, suspension))
                const [username, authorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(extension.authorId)])
                const extensionDays = extension.duration / 86400000
                discordMessageJob.run('log', `**${authorName}** extended **${username}**'s suspension ` +
                    `with **${extensionDays}** ${pluralize('day', extensionDays)}`)
            }
        },
        tableName: 'suspension_extensions'
    })

    SuspensionExtension.associate = models => {
        SuspensionExtension.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionExtension
}
