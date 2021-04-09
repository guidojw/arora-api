'use strict'

module.exports = {
  up: async (queryInterface /* , Sequelize */) => {
    try {
      await queryInterface.describeTable('SequelizeMeta')
      return queryInterface.dropTable('SequelizeMeta')
    } catch (err) {
      if (!err.message.includes('No description found for "SequelizeMeta" table.')) {
        throw err
      }
    }
  },

  down: (/* queryInterface, Sequelize */) => {
    // Do nothing, we want to keep using the underscored table name.
    return Promise.resolve()
  }
}
