'use strict'
module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })

    Admin.findById = async id => {
        try {
            return await Admin.findOne({
                where: { id },
                attributes: ['key']
            })
        } catch (err) {
            return null
        }
    }

    return Admin
}
