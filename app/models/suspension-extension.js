'use strict'
const { userService } = require('../services')
const { discordMessageJob } = require('../jobs')
const pluralize = require('pluralize')

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
            async afterCreate (extension) {
                const suspension = await sequelize.models.Suspension.findByPk(extension.suspensionId)
                const [username, authorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(extension.authorId)])
                const extensionDays = extension.duration / 86400000
                discordMessageJob.run('log', `**${authorName}** extended **${username}**'s suspension ` +
                    `with **${extensionDays}** ${pluralize('day', extensionDays)}`)
            }
        },
        tableName: 'suspension_extensions'
    })

    SuspensionExtension.associate = function (models) {
        SuspensionExtension.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionExtension
}
