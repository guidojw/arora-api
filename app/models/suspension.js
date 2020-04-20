'use strict'
module.exports = (sequelize, DataTypes) => {
    const Suspension = sequelize.define('Suspension', {
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
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rankBack: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {})

    Suspension.associate = models => {
        Suspension.hasOne(models.SuspensionCancellation, {
            foreignKey: { allowNull: false, name: 'suspensionId' }
        })
        Suspension.hasMany(models.SuspensionExtension, { foreignKey: { allowNull: false, name: 'suspensionId' }})
    }

    Suspension.loadScopes = models => {
        Suspension.addScope('defaultScope', {
            where: { '$SuspensionCancellation.id$': null },
            include: [{
                model: models.SuspensionCancellation,
                attributes: []
            }]
        })
    }

    return Suspension
}
