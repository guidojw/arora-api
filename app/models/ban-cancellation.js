'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const BanCancellation = sequelize.define('BanCancellation', {
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
                const ban = await sequelize.models.Ban.findByPk(cancellation.banId)
                const [username, authorName] = await Promise.all([userService.getUsername(ban.userId),
                    userService.getUsername(cancellation.authorId)])
                discordMessageJob('log', `**${authorName}** unbanned **${username}** with reason "*${
                    cancellation.reason}*"`)
            }
        }
    })

    BanCancellation.associate = models => {
        BanCancellation.belongsTo(models.Ban, {
            foreignKey: { allowNull: false, name: 'banId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return BanCancellation
}
