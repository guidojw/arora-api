'use strict'
module.exports = (sequelize, DataTypes) => {
    const BanCancellation = sequelize.define('BanCancellation', {
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

    BanCancellation.associate = models => {
        BanCancellation.belongsTo(models.Ban, {
            foreignKey: { allowNull: false, name: 'banId' },
            onDelete: 'cascade',
            hooks: true
        })
    }

    return BanCancellation
}
