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
        try {
            let admin = await Admin.findOne({
                where: { id: id },
                attributes: ['key']
            })
            return admin
        } catch(err) {
            return
        }
    }

    return Admin
}
