'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const Ban = sequelize.define('Ban', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'author_id'
        }
    }, {
        hooks: {
            afterCreate: async ban => {
                const [username, authorName] = await Promise.all([userService.getUsername(ban.userId),
                    userService.getUsername(ban.authorId)])
                discordMessageJob('log', `**${authorName}** banned **${username}** with reason  "*${ban
                    .reason}*"`)
            },

            afterUpdate: async (ban, options) => {
                const [username, editorName] = await Promise.all([userService.getUsername(ban.userId),
                    userService.getUsername(options.editorId)])
                if (ban.changed('reason')) {
                    discordMessageJob('log', `**${editorName}** changed the reason of **${username}**'s`
                        + ` ban to *"${ban.reason}"*`)
                }
                if (ban.changed('authorId')) {
                    const authorName = await userService.getUsername(ban.authorId)
                    discordMessageJob('log', `**${editorName}** changed the author of **${username}**` +
                        `'s ban to **${authorName}**`)
                }
            }
        },
        tableName: 'bans'
    })

    Ban.associate = models => {
        Ban.hasOne(models.BanCancellation, { foreignKey: { allowNull: false, name: 'banId' }})
    }

    Ban.loadScopes = models => {
        Ban.addScope('defaultScope', {
            where: { '$BanCancellation.id$': null },
            include: [{ model: models.BanCancellation, attributes: [] }]
        })
    }

    return Ban
}
