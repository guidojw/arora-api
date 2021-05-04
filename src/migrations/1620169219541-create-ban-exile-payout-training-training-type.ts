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
  }

  async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ban_extensions')
    await queryRunner.dropTable('ban_cancellations')
    await queryRunner.dropTable('bans')
  }
}
