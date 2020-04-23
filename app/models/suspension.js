'use strict'
const { Op } = require('sequelize')

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
            allowNull: false,
            defaultValue: DataTypes.NOW
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
        },
        endDate: {
            type: DataTypes.VIRTUAL,
            async get () {
                let endDate = this.date + this.duration
                const extensions = await sequelize.models.SuspensionExtension.findAll({ where: { suspensionId:
                        this.id }})
                for (const extension of extensions) {
                    endDate += extension.duration
                }
                return endDate
            }
        }
    }, {})

    Suspension.associate = models => {
        Suspension.hasOne(models.SuspensionCancellation, {
            foreignKey: { allowNull: false, name: 'suspensionId' }
        })
        Suspension.hasMany(models.SuspensionExtension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            as: 'extensions'
        })
    }

    // Suspension.loadScopes = models => {
    //     Suspension.addScope('defaultScope', {
    //         where: { '$SuspensionCancellation.id$': null, endDate: { [Op.gt]: Date.now() }},
    //         include: [{
    //             model: models.SuspensionCancellation,
    //             attributes: []
    //         }, {
    //             model: models.SuspensionExtension,
    //             as: 'extensions'
    //         }]
    //     })
    //     Suspension.addScope('finished', {
    //         where: { endDate: { [Op.lt]: Date.now() }},
    //         include: [{
    //             model: models.SuspensionExtension,
    //             as: 'extensions'
    //         }]
    //     })
    // }

    return Suspension
}
