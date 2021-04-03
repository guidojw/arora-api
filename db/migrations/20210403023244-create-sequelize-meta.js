'use strict'

module.exports = {
  up: async (queryInterface /* , Sequelize */) => {
    try {
      const attributes = await queryInterface.describeTable('SequelizeMeta')
      const rows = (await queryInterface.sequelize.query('SELECT name FROM "SequelizeMeta"'))
        .shift()
        .concat([{ name: '20210403023244-create-sequelize-meta.js' }])

      await queryInterface.createTable('sequelize_meta', attributes)
      await queryInterface.bulkInsert('sequelize_meta', rows)
    } catch (err) {
      if (!err.message.includes('No description found for "SequelizeMeta" table.')) {
        throw err
      }
    }
  },

  down: async (/* queryInterface, Sequelize */) => {
    // Do nothing, we want to keep the underscored table name.
  }
}
