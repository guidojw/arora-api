'use strict'
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
            afterCreate: training => {

            },
            afterUpdate: training => {
                console.log(training._changed)
                if (training._changed.authorId) {
                    console.log('authorId')
                }
                if (training._changed.notes) {
                    console.log('notes')
                }
                if (training._changed.type) {
                    console.log('type')
                }
                if (training._changed.date) {
                    console.log('date')
                }
            }
        }
    })

    Training.associate = models => {
        Training.hasOne(models.TrainingCancellation, { foreignKey: { allowNull: false, name: 'trainingId' }})
    }

    return Training
}
