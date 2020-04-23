'use strict'
module.exports = (sequelize, DataTypes) => {
    const SuspensionExtension = sequelize.define('SuspensionExtension', {
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
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: extension => {

            }
        }
    })

    SuspensionExtension.associate = models => {
        SuspensionExtension.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionExtension
}
