'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const pluralize = require('pluralize')

module.exports = (sequelize, DataTypes) => {
    const SuspensionExtension = sequelize.define('SuspensionExtension', {
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
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: async extension => {
                const suspension = await sequelize.models.Suspension.findByPk(extension.suspensionId)
                const [username, authorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(extension.authorId)])
                const extensionDays = extension.duration / 86400000
                discordMessageJob('log', `**${authorName}** extended **${username}**'s suspension with` +
                    `**${extensionDays}** ${pluralize('day', extensionDays)}`)
            }
        }
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
