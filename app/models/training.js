'use strict'
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
    }, {})

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
