'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('training_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      abbreviation: {
        type: Sequelize.STRING(8),
        allowNull: false
      }
    })

    const trainingTypes = (await queryInterface.sequelize.query('SELECT DISTINCT type FROM trainings'))
      .shift()
      .map(trainingType => {
        return {
          name: trainingType.type.toUpperCase(),
          abbreviation: trainingType.type
        }
      })
    await queryInterface.bulkInsert('training_types', trainingTypes)

    const cdTrainingTypeId = await queryInterface.rawSelect(
      'training_types',
      { where: { abbreviation: 'cd'}},
      ['id']
    )
    const csrTrainingTypeId = await queryInterface.rawSelect(
      'training_types',
      { where: { abbreviation: 'csr'}},
      ['id']
    )

    await queryInterface.changeColumn('trainings', 'type', {
      type: `VARCHAR(255) USING CAST ( "type" as VARCHAR(255) )`,
      allowNull: false
    })
    await queryInterface.dropEnum('enum_trainings_type')

    if (cdTrainingTypeId) {
      await queryInterface.bulkUpdate('trainings', { type: cdTrainingTypeId.toString() }, { type: 'cd' })
    }
    if (csrTrainingTypeId) {
      await queryInterface.bulkUpdate('trainings', { type: csrTrainingTypeId.toString()}, { type: 'csr' })
    }

    await queryInterface.changeColumn('trainings', 'type', {
      type: `INTEGER USING CAST ( "type" as INTEGER )`,
      allowNull: false
    })
    await queryInterface.addConstraint('trainings', {
      fields: ['type'],
      type: 'foreign key',
      name: 'trainings_type_id_training_types_fk',
      references: {
        table: 'training_types',
        field: 'id'
      },
      onDelete: 'CASCADE'
    })
    return queryInterface.renameColumn('trainings', 'type', 'type_id')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('training_types', { abbreviation: { [Sequelize.Op.notIn]: ['cd', 'csr'] } })

    await queryInterface.renameColumn('trainings', 'type_id', 'type')
    await queryInterface.removeConstraint('trainings', 'trainings_type_id_training_types_fk')
    await queryInterface.changeColumn('trainings', 'type', {
      type: `VARCHAR(255) USING CAST ( "type" as VARCHAR(255) )`,
      allowNull: false
    })

    const cdTrainingTypeId = await queryInterface.rawSelect(
      'training_types',
      { where: { abbreviation: 'cd'}},
      ['id']
    )
    const csrTrainingTypeId = await queryInterface.rawSelect(
      'training_types',
      { where: { abbreviation: 'csr'}},
      ['id']
    )

    await queryInterface.dropTable('training_types')

    if (cdTrainingTypeId) {
      await queryInterface.bulkUpdate('trainings', { type: 'cd' }, { type: cdTrainingTypeId.toString() })
    }
    if (csrTrainingTypeId) {
      await queryInterface.bulkUpdate('trainings', { type: 'csr' }, { type: csrTrainingTypeId.toString() })
    }

    await queryInterface.sequelize.query('CREATE TYPE enum_trainings_type AS ENUM (\'cd\', \'csr\')')
    return queryInterface.changeColumn('trainings', 'type', {
      type: `enum_trainings_type USING CAST ( "type" AS enum_trainings_type )`,
      allowNull: false
    })
  }
}
