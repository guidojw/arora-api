'use strict'
module.exports = (sequelize, DataTypes) => {
    const SuspensionExtension = sequelize.define('SuspensionExtension', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {})

    SuspensionExtension.associate = models => {
        SuspensionExtension.belongsTo(models.Suspension, { foreignKey: { allowNull: false }, onDelete: 'cascade',
            hooks: true })
    }

    return SuspensionExtension
}
