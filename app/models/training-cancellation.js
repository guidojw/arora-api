'use strict'
const userService = require('../services/user')
const discordMessageJob = require('../jobs/discord-message')

module.exports = (sequelize, DataTypes) => {
    const TrainingCancellation = sequelize.define('TrainingCancellation', {
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
        }
    }, {
        hooks: {
            async afterCreate (cancellation) {
                const authorName = await userService.getUsername(cancellation.authorId)
                discordMessageJob.run('log', `**${authorName}** cancelled training **${cancellation
                    .trainingId}** with reason "*${cancellation.reason}*"`)
            }
        },
        tableName: 'training_cancellations'
    })

    TrainingCancellation.associate = function (models) {
        TrainingCancellation.belongsTo(models.Training, {
            foreignKey: { allowNull: false, name: 'trainingId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return TrainingCancellation
}
