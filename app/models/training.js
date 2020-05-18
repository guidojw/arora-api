'use strict'
const timeHelper = require('../helpers/time')
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')
const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Training = sequelize.define('Training', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'author_id'
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
            async afterCreate (training) {
                const dateString = timeHelper.getDate(training.date)
                const timeString = timeHelper.getTime(training.date)
                const authorName = await userService.getUsername(training.authorId)
                discordMessageJob.run('log', `**${authorName}** scheduled a **${training.type
                    .toUpperCase()}** training at **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 
                    'CEST' : 'CET'}**${training.notes ? ' with note "*' + training.notes + '*"' : ''}`)
            },

            async afterUpdate (training, options) {
                const editorName = await userService.getUsername(options.editorId)
                if (training.changed('authorId')) {
                    const authorName = await userService.getUsername(training.authorId)
                    discordMessageJob.run('log', `**${editorName}** changed training **${training.id}` +
                        `**'s host to **${authorName}**`)
                }
                if (training.changed('notes')) {
                    discordMessageJob.run('log', `**${editorName}** changed training **${training.id}` +
                        `**'s notes to "*${training.notes}*"`)
                }
                if (training.changed('type')) {
                    discordMessageJob.run('log', `**${editorName}** changed training **${training.id}` +
                        `**'s type to **${training.type.toUpperCase()}**`)
                }
                if (training.changed('date')) {
                    const dateString = timeHelper.getDate(training.date)
                    const timeString = timeHelper.getTime(training.date)
                    discordMessageJob.run('log', `**${editorName}** changed training **${training.id}` +
                        `**'s date to **${dateString} ${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 
                            'CET'}**`)

                }
            }
        },
        tableName: 'trainings'
    })

    Training.associate = function (models) {
        Training.hasOne(models.TrainingCancellation, { foreignKey: { allowNull: false, name: 'trainingId' }})
    }

    Training.loadScopes = function (models) {
        Training.addScope('defaultScope', {
            where: { '$TrainingCancellation.id$': null, date: {
                [Op.gt]: sequelize.literal('NOW() - INTERVAL \'15 minutes\'')
            }},
            include: [{
                model: models.TrainingCancellation,
                attributes: []
            }]
        })
    }

    return Training
}
