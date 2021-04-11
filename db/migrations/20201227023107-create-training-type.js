'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
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
      }, { transaction: t })

      const trainingTypes = (await queryInterface.sequelize.query('SELECT DISTINCT type FROM trainings'))
        .shift()
        .map(trainingType => {
          const type = trainingType.type.toUpperCase()
          return { abbreviation: type, name: type }
        })
      if (trainingTypes.length > 0) {
        await queryInterface.bulkInsert('training_types', trainingTypes, { transaction: t })
      }

      const cdTrainingTypeId = await queryInterface.rawSelect(
        'training_types',
        { where: { abbreviation: 'CD' }, transaction: t },
        ['id']
      )
      const csrTrainingTypeId = await queryInterface.rawSelect(
        'training_types',
        { where: { abbreviation: 'CSR' }, transaction: t },
        ['id']
      )

      await queryInterface.changeColumn(
        'trainings',
        'type',
        {
          type: 'VARCHAR(255) USING CAST ( "type" as VARCHAR(255) )',
          allowNull: false
        },
        { transaction: t }
      )
      await queryInterface.dropEnum('enum_trainings_type', { transaction: t })

      if (cdTrainingTypeId) {
        await queryInterface.bulkUpdate(
          'trainings',
          { type: cdTrainingTypeId.toString() },
          { type: 'cd' },
          { transaction: t }
        )
      }
      if (csrTrainingTypeId) {
        await queryInterface.bulkUpdate(
          'trainings',
          { type: csrTrainingTypeId.toString() },
          { type: 'csr' },
          { transaction: t }
        )
      }

      await queryInterface.changeColumn(
        'trainings',
        'type',
        {
          type: 'INTEGER USING CAST ( "type" as INTEGER )',
          allowNull: false
        },
        { transaction: t }
      )
      await queryInterface.addConstraint('trainings', {
        fields: ['type'],
        type: 'foreign key',
        name: 'trainings_type_id_training_types_fk',
        references: {
          table: 'training_types',
          field: 'id'
        },
        onDelete: 'CASCADE',
        transaction: t
      })
      return queryInterface.renameColumn(
        'trainings',
        'type',
        'type_id',
        { transaction: t }
      )
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.bulkDelete(
        'training_types',
        { abbreviation: { [Sequelize.Op.notIn]: ['CD', 'CSR'] } },
        { transaction: t }
      )

      await queryInterface.renameColumn(
        'trainings',
        'type_id',
        'type',
        { transaction: t }
      )
      await queryInterface.removeConstraint(
        'trainings',
        'trainings_type_id_training_types_fk',
        { transaction: t }
      )
      await queryInterface.changeColumn(
        'trainings',
        'type',
        {
          type: 'VARCHAR(255) USING CAST ( "type" as VARCHAR(255) )',
          allowNull: false
        },
        { transaction: t }
      )

      const cdTrainingTypeId = await queryInterface.rawSelect(
        'training_types',
        { where: { abbreviation: 'CD' }, transaction: t },
        ['id']
      )
      const csrTrainingTypeId = await queryInterface.rawSelect(
        'training_types',
        { where: { abbreviation: 'CSR' }, transaction: t },
        ['id']
      )

      await queryInterface.dropTable('training_types', { transaction: t })

      if (cdTrainingTypeId) {
        await queryInterface.bulkUpdate(
          'trainings',
          { type: 'cd' },
          { type: cdTrainingTypeId.toString() },
          { transaction: t }
        )
      }
      if (csrTrainingTypeId) {
        await queryInterface.bulkUpdate(
          'trainings',
          { type: 'csr' },
          { type: csrTrainingTypeId.toString() },
          { transaction: t }
        )
      }

      await queryInterface.sequelize.query(
        'CREATE TYPE enum_trainings_type AS ENUM (\'cd\', \'csr\')',
        { transaction: t }
      )
      return queryInterface.changeColumn(
        'trainings',
        'type',
        {
          type: 'enum_trainings_type USING CAST ( "type" AS enum_trainings_type )',
          allowNull: false
        },
        { transaction: t }
      )
    })
  }
}
