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
        let admin = await Admin.findOne({
            where: { id: id },
        })
        return admin
    }

    return Admin
}
