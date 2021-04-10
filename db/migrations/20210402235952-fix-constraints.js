'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        updateForeignKey(queryInterface, 'ban_cancellations', 'ban_id', 'bans', 'CASCADE', t),
        updateForeignKey(queryInterface, 'suspension_cancellations', 'suspension_id', 'suspensions', 'CASCADE', t),
        updateForeignKey(queryInterface, 'suspension_extensions', 'suspension_id', 'suspensions', 'CASCADE', t),
        updateForeignKey(queryInterface, 'training_cancellations', 'training_id', 'trainings', 'CASCADE', t)
      ])

      await queryInterface.changeColumn(
        'trainings',
        'type_id',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction: t }
      )
      await queryInterface.removeConstraint(
        'trainings',
        'trainings_type_id_training_types_fk',
        { transaction: t }
      )
      return queryInterface.addConstraint('trainings', {
        fields: ['type_id'],
        type: 'foreign key',
        name: 'trainings_type_id_fkey',
        references: {
          table: 'training_types',
          field: 'id'
        },
        onDelete: 'SET NULL',
        transaction: t
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeConstraint('trainings', 'trainings_type_id_fkey', { transaction: t })
      await queryInterface.addConstraint('trainings', {
        fields: ['type_id'],
        type: 'foreign key',
        name: 'trainings_type_id_training_types_fk',
        references: {
          table: 'training_types',
          field: 'id'
        },
        onDelete: 'CASCADE',
        transaction: t
      })
      await queryInterface.bulkDelete(
        'trainings',
        { type_id: null }, // will delete trainings with typeId = null
        { transaction: t }
      )
      await queryInterface.changeColumn(
        'trainings',
        'type_id',
        { type: Sequelize.INTEGER, allowNull: false },
        { transaction: t }
      )

      return Promise.all([
        updateForeignKey(queryInterface, 'training_cancellations', 'training_id', 'trainings', 'NO ACTION', t),
        updateForeignKey(queryInterface, 'suspension_extensions', 'suspension_id', 'suspensions', 'NO ACTION', t),
        updateForeignKey(queryInterface, 'suspension_cancellations', 'suspension_id', 'suspensions', 'NO ACTION', t),
        updateForeignKey(queryInterface, 'ban_cancellations', 'ban_id', 'bans', 'NO ACTION', t)
      ])
    })
  }
}

async function updateForeignKey (queryInterface, tableName, columnName, targetTableName, onDeleteAction, transaction) {
  await queryInterface.removeConstraint(tableName, `${tableName}_${columnName}_fkey`, { transaction })
  return queryInterface.addConstraint(tableName, {
    fields: [columnName],
    type: 'foreign key',
    name: `${tableName}_${columnName}_fkey`,
    references: {
      table: targetTableName,
      field: 'id'
    },
    onDelete: onDeleteAction,
    transaction
  })
}
