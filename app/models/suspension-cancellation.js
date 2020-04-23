'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const SuspensionCancellation = sequelize.define('SuspensionCancellation', {
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
                const suspension = await sequelize.models.Suspension.findByPk(cancellation.suspensionId)
                const [username, authorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(cancellation.authorId)])
                discordMessageJob('log', `**${authorName}** cancelled **${username}**'s suspension with `
                    + `reason "*${cancellation.reason}*"`)
            }
        }
    })

    SuspensionCancellation.associate = models => {
        SuspensionCancellation.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionCancellation
}
