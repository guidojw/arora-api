'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      updateForeignKey(queryInterface, 'ban_cancellations', 'ban_id', 'bans', 'CASCADE'),
      updateForeignKey(queryInterface, 'suspension_cancellations', 'suspension_id', 'suspensions', 'CASCADE'),
      updateForeignKey(queryInterface, 'suspension_extensions', 'suspension_id', 'suspensions', 'CASCADE'),
      updateForeignKey(queryInterface, 'training_cancellations', 'training_id', 'trainings', 'CASCADE')
    ])

    await queryInterface.changeColumn(
      'trainings',
      'type_id',
      { type: Sequelize.INTEGER, allowNull: true }
    )
    await queryInterface.removeConstraint('trainings', 'trainings_type_id_training_types_fk')
    await queryInterface.addConstraint('trainings', {
      fields: ['type_id'],
      type: 'foreign key',
      name: 'trainings_type_id_fkey',
      references: {
        table: 'training_types',
        field: 'id'
      },
      onDelete: 'SET NULL'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('trainings', 'trainings_type_id_fkey')
    await queryInterface.addConstraint('trainings', {
      fields: ['type_id'],
      type: 'foreign key',
      name: 'trainings_type_id_training_types_fk',
      references: {
        table: 'training_types',
        field: 'id'
      },
      onDelete: 'CASCADE'
    })
    await queryInterface.bulkDelete('trainings', { type_id: null }) // will delete trainings with typeId = null
    await queryInterface.changeColumn(
      'trainings',
      'type_id',
      { type: Sequelize.INTEGER, allowNull: false }
    )

    await Promise.all([
      updateForeignKey(queryInterface, 'training_cancellations', 'training_id', 'trainings'),
      updateForeignKey(queryInterface, 'suspension_extensions', 'suspension_id', 'suspensions'),
      updateForeignKey(queryInterface, 'suspension_cancellations', 'suspension_id', 'suspensions'),
      updateForeignKey(queryInterface, 'ban_cancellations', 'ban_id', 'bans')
    ])
  }
}

async function updateForeignKey (queryInterface, tableName, columnName, targetTableName, onDeleteAction = 'NO ACTION') {
  await queryInterface.removeConstraint(tableName, `${tableName}_${columnName}_fkey`)
  return queryInterface.addConstraint(tableName, {
    fields: [columnName],
    type: 'foreign key',
    name: `${tableName}_${columnName}_fkey`,
    references: {
      table: targetTableName,
      field: 'id'
    },
    onDelete: onDeleteAction
  })
}
