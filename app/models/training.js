'use strict'
const timeHelper = require('../helpers/time')
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const Training = sequelize.define('Training', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['cd', 'csr']
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: async training => {
                const dateString = timeHelper.getDate(training.date)
                const timeString = timeHelper.getTime(training.date)
                const authorUsername = await userService.getUsername(training.authorId)
                discordMessageJob('log', `**${authorUsername}** scheduled a **${training.type
                    .toUpperCase()}** training at **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 
                    'CEST' : 'CET'}**${training.notes ? ' with note "*' + training.notes + '*"' : ''}`)
            },

            afterUpdate: async (training, options) => {
                const editorName = await userService.getUsername(options.editorId)
                if (training.changed('authorId')) {
                    const authorName = await userService.getUsername(training.authorId)
                    discordMessageJob('log', `**${editorName}** changed training **${training.id}**'s ` +
                        `host to **${authorName}**`)
                }
                if (training.changed('notes')) {
                    discordMessageJob('log', `**${editorName}** changed training **${training.id}**'s ` +
                        `notes to "*${training.notes}*"`)
                }
                if (training.changed('type')) {
                    discordMessageJob('log', `**${editorName}** changed training **${training.id}**'s ` +
                        `type to **${training.type.toUpperCase()}**`)
                }
                if (training.changed('time')) {
                    const dateString = timeHelper.getDate(training.date)
                    const timeString = timeHelper.getTime(training.date)
                    discordMessageJob('log', `**${editorName}** changed training **${training.id}**'s ` +
                        `date to **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**`)

                }
            }
        }
    })

    Training.associate = models => {
        Training.hasOne(models.TrainingCancellation, { foreignKey: { allowNull: false, name: 'trainingId' }})
    }

    Training.loadScopes = models => {
        Training.addScope('defaultScope', {
            where: { '$TrainingCancellation.id$': null },
            include: [{
                model: models.TrainingCancellation,
                attributes: []
            }]
        })
    }

    return Training
}
