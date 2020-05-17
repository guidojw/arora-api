'use strict'
const { userService } = require('../services')
const { discordMessageJob } = require('../jobs')

module.exports = (sequelize, DataTypes) => {
    const BanCancellation = sequelize.define('BanCancellation', {
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
                const ban = await sequelize.models.Ban.unscoped().findByPk(cancellation.banId)
                const [username, authorName] = await Promise.all([userService.getUsername(ban.userId),
                    userService.getUsername(cancellation.authorId)])
                discordMessageJob('log', `**${authorName}** unbanned **${username}** with reason "*${
                    cancellation.reason}*"`)
            }
        },
        tableName: 'ban_cancellations'
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
