'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await  queryInterface.createTable('training_types', {
      name: {
        primaryKey: true,
        type: Sequelize.STRING
      }
    })
    await queryInterface.bulkInsert('training_types', [{ name: 'cd' }, { name: 'csr' }])

    await queryInterface.changeColumn('trainings', 'type', {
      type: `VARCHAR (255) USING CAST ( "type" as VARCHAR (255) )`,
      allowNull: false
    })
    await queryInterface.addConstraint('trainings', {
      fields: ['type'],
      type: 'foreign key',
      name: 'trainings_type_training_types_fk',
      references: {
        table: 'training_types',
        field: 'name'
      },
      onDelete: 'CASCADE'
    })
    return queryInterface.dropEnum('enum_trainings_type')
  },

  down: async (queryInterface /* , Sequelize */) => {
    const trainingTypes = (await queryInterface.sequelize.query('SELECT DISTINCT type FROM trainings'))
      .shift()
      .map(training => training.type)
    const newTrainingTypes = trainingTypes.filter(trainingType => trainingType !== 'cd' && trainingType !== 'csr')
    await queryInterface.bulkDelete('trainings', { type: newTrainingTypes })

    await queryInterface.sequelize.query('CREATE TYPE enum_trainings_type AS ENUM (\'cd\', \'csr\')')
    await queryInterface.removeConstraint('trainings', 'trainings_type_training_types_fk')
    await queryInterface.changeColumn('trainings', 'type', {
      type: `enum_trainings_type USING CAST ( type AS enum_trainings_type )`,
      allowNull: false
    })

    return queryInterface.dropTable('training_types')
  }
}
