'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

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
            async afterCreate (cancellation) {
                const ban = await sequelize.models.Ban.unscoped().findByPk(cancellation.banId)
                const [username, authorName] = await Promise.all([userService.getUsername(ban.userId),
                    userService.getUsername(cancellation.authorId)])
                discordMessageJob.run('log', `**${authorName}** unbanned **${username}** with reason "*${
                    cancellation.reason}*"`)
            }
        },
        tableName: 'ban_cancellations'
    })

    BanCancellation.associate = function (models) {
        BanCancellation.belongsTo(models.Ban, {
            foreignKey: { allowNull: false, name: 'banId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return BanCancellation
}
