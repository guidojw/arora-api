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

    Admin.findById = async (id) => {
        return Admin.findOne({
            where: { id: id },
        })
    }

    return Admin
}
