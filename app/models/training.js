'use strict'
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
        tableName: 'trainings'
    })

    Training.associate = models => {
        Training.hasOne(models.TrainingCancellation, {
            foreignKey: {
                allowNull: false,
                name: 'trainingId'
            }
        })
    }

    Training.loadScopes = models => {
        Training.addScope('defaultScope', {
            where: {
                '$TrainingCancellation.id$': null,
                date: {
                    [Op.gt]: sequelize.literal('NOW() - INTERVAL \'15 minutes\'')
                }
            },
            include: [{
                model: models.TrainingCancellation,
                attributes: []
            }]
        })
    }

    return Training
}
