import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class createBanExilePayoutTrainingTrainingType1620169219541 implements MigrationInterface {
  async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'bans',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'date',
        type: 'timestamp with time zone',
        default: 'now()'
      }, {
        name: 'duration',
        type: 'int',
        isNullable: true
      }, {
        name: 'group_id',
        type: 'int'
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }, {
        name: 'role_id',
        type: 'int'
      }, {
        name: 'user_id',
        type: 'bigint'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'ban_cancellations',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'ban_id',
        type: 'int'
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }]
    }))
    await queryRunner.createForeignKey('ban_cancellations', new TableForeignKey({
      columnNames: ['ban_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'bans',
      onDelete: 'CASCADE'
    }))

    await queryRunner.createTable(new Table({
      name: 'ban_extensions',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'ban_id',
        type: 'int'
      }, {
        name: 'duration',
        type: 'int'
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }]
    }))
    await queryRunner.createForeignKey('ban_extensions', new TableForeignKey({
      columnNames: ['ban_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'bans',
      onDelete: 'CASCADE'
    }))

    await queryRunner.createTable(new Table({
      name: 'exiles',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'date',
        type: 'timestamp with time zone',
        default: 'now()'
      }, {
        name: 'group_id',
        type: 'int'
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }, {
        name: 'user_id',
        type: 'bigint'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'payouts',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'group_id',
        type: 'int'
      }, {
        name: 'until',
        type: 'timestamp with time zone'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'training_types',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'abbreviation',
        type: 'varchar(8)'
      }, {
        name: 'group_id',
        type: 'int'
      }, {
        name: 'name',
        type: 'varchar(255)'
      }]
    }))

    await queryRunner.createTable(new Table({
      name: 'trainings',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'notes',
        type: 'varchar(255)',
        isNullable: true
      }, {
        name: 'date',
        type: 'timestamp with time zone'
      }, {
        name: 'group_id',
        type: 'int'
      }, {
        name: 'type_id',
        type: 'int',
        isNullable: true
      }]
    }))
    await queryRunner.createForeignKey('trainings', new TableForeignKey({
      columnNames: ['type_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'training_types',
      onDelete: 'SET NULL'
    }))
    await queryRunner.createTable(new Table({
      name: 'training_cancellations',
      columns: [{
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true
      }, {
        name: 'author_id',
        type: 'bigint'
      }, {
        name: 'training_id',
        type: 'int'
      }, {
        name: 'reason',
        type: 'varchar(255)'
      }]
    }))
    await queryRunner.createForeignKey('training_cancellations', new TableForeignKey({
      columnNames: ['training_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'trainings',
      onDelete: 'CASCADE'
    }))
  }

  async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('training_cancellations')
    await queryRunner.dropTable('trainings')

    await queryRunner.dropTable('training_types')

    await queryRunner.dropTable('payouts')

    await queryRunner.dropTable('exiles')

    await queryRunner.dropTable('ban_extensions')
    await queryRunner.dropTable('ban_cancellations')
    await queryRunner.dropTable('bans')
  }
}
