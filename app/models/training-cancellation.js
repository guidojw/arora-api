'use strict'
module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {})

    TrainingCancellation.associate = function (models) {
        TrainingCancellation.belongsTo(models.Training, { foreignKey: { allowNull: false }, onDelete: 'cascade',
            hooks: true })
    }

    return TrainingCancellation
}
