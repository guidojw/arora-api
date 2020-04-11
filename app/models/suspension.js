'use strict'
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const Suspension = sequelize.define('Suspension', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
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
        }
    }, {
        hooks: {
            afterCreate: suspension => {

            },
            afterUpdate: suspension => {
                console.log(suspension._changed)
                if (suspension._changed.authorId) {
                    console.log('userId')
                }
                if (suspension._changed.reason) {
                    console.log('reason')
                }
                if (suspension._changed.date) {
                    console.log('date')
                }
                if (suspension._changed.rankBack) {
                    console.log('rankBack')
                }
            }
        }
    })

    Suspension.associate = models => {
        Suspension.hasOne(models.SuspensionCancellation, {
            foreignKey: { allowNull: false, name: 'suspensionId' }
        })
        Suspension.hasMany(models.SuspensionExtension, { foreignKey: { allowNull: false, name: 'suspensionId' }})
    }

    return Suspension
}
