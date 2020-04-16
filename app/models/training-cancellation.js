'use strict'
module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
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
    }, {})

    TrainingCancellation.associate = models => {
        TrainingCancellation.belongsTo(models.Training, {
            foreignKey: { allowNull: false, name: 'trainingId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return TrainingCancellation
}
