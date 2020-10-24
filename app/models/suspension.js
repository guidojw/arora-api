'use strict'
module.exports = (sequelize, DataTypes) => {
    const Suspension = sequelize.define('Suspension', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'author_id'
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
            allowNull: false,
            field: 'user_id'
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rankBack: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'rank_back'
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        endDate: {
            type: DataTypes.VIRTUAL,
            async get () {
                let duration = this.duration
                const extensions = await sequelize.models.SuspensionExtension.findAll({
                    where: { suspensionId: this.id }
                })
                for (const extension of extensions) {
                    duration += extension.duration
                }
                return new Date(this.date.getTime() + duration)
            }
        }
    }, {
        tableName: 'suspensions'
    })

    Suspension.associate = models => {
        Suspension.hasOne(models.SuspensionCancellation, {
            foreignKey: {
                allowNull: false,
                name: 'suspensionId'
            }
        })

        Suspension.hasMany(models.SuspensionExtension, {
            foreignKey: {
                allowNull: false,
                name: 'suspensionId'
            },
            as: 'extensions'
        })
    }

    Suspension.loadScopes = models => {
        Suspension.addScope('defaultScope', {
            where: {
                '$SuspensionCancellation.id$': null,
                finished: false
            },
            include: [{
                model: models.SuspensionCancellation,
                attributes: [],
            }, {
                model: models.SuspensionExtension,
                as: 'extensions'
            }],
            subQuery: false
        })

        Suspension.addScope('finished', {
            where: {
                '$SuspensionCancellation.id$': null,
                finished: true
            },
            include: [{
                model: models.SuspensionCancellation,
                attributes: [],
            }, {
                model: models.SuspensionExtension,
                as: 'extensions'
            }],
            subQuery: false
        })
    }

    return Suspension
}
