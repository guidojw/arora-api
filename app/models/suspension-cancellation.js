'use strict'
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const SuspensionCancellation = sequelize.define('SuspensionCancellation', {
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            afterCreate: cancellation => {

            }
        }
    })

    SuspensionCancellation.associate = models => {
        SuspensionCancellation.belongsTo(models.Suspension, {
            foreignKey: { allowNull: false, name: 'suspensionId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return SuspensionCancellation
}
