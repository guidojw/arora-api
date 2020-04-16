'use strict'
module.exports = (sequelize, DataTypes) => {
    const SuspensionCancellation = sequelize.define('SuspensionCancellation', {
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

    SuspensionCancellation.associate = models => {
        SuspensionCancellation.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionCancellation
}
