'use strict'
const { Op } = require('sequelize')
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const pluralize = require('pluralize')

module.exports = (sequelize, DataTypes) => {
    const Suspension = sequelize.define('Suspension', {
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
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rankBack: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        endDate: {
            type: DataTypes.VIRTUAL,
            async get () {
                let endDate = this.date + this.duration
                const extensions = await sequelize.models.SuspensionExtension.findAll({ where: { suspensionId:
                        this.id }})
                for (const extension of extensions) {
                    endDate += extension.duration
                }
                return endDate
            }
        }
    }, {
        hooks: {
            afterCreate: async suspension => {
                const days = suspension.duration / 86400000
                const [username, authorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(suspension.authorId)])
                discordMessageJob('log', `**${authorName}** suspended **${username}** for **${days}** ` +
                    `${pluralize('day', days)} with reason "*${suspension.reason}*"`)
            },
            afterUpdate: async (suspension, options) => {
                const [username, editorName] = await Promise.all([userService.getUsername(suspension.userId),
                    userService.getUsername(options.editorId)])
                if (suspension.changed('authorId')) {
                    const authorName = await userService.getUsername(suspension.authorId)
                    discordMessageJob('log', `**${editorName}** changed the author of **${username}*` +
                        `*'s suspension to **${authorName}**`)
                }
                if (suspension.changed('reason')) {
                    discordMessageJob('log', `**${editorName}** changed the reason of **${username}*` +
                        `*'s suspension to *"${suspension.reason}"*`)
                }
                if (suspension.changed('rankBack')) {
                    discordMessageJob('log', `**${editorName}** changed the rankBack option of **${
                        username}**'s suspension to **${suspension.rankBack ? 'yes' : 'no'}**`)
                }
            }
        }
    })

    Suspension.associate = models => {
        Suspension.hasOne(models.SuspensionCancellation, {
            foreignKey: { allowNull: false, name: 'suspensionId' }
        })
        Suspension.hasMany(models.SuspensionExtension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            as: 'extensions'
        })
    }

    // Suspension.loadScopes = models => {
    //     Suspension.addScope('defaultScope', {
    //         where: { '$SuspensionCancellation.id$': null, endDate: { [Op.gt]: Date.now() }},
    //         include: [{
    //             model: models.SuspensionCancellation,
    //             attributes: []
    //         }, {
    //             model: models.SuspensionExtension,
    //             as: 'extensions'
    //         }]
    //     })
    //     Suspension.addScope('finished', {
    //         where: { endDate: { [Op.lt]: Date.now() }},
    //         include: [{
    //             model: models.SuspensionExtension,
    //             as: 'extensions'
    //         }]
    //     })
    // }

    return Suspension
}
