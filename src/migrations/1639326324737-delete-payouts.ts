import { type MigrationInterface, type QueryRunner, Table } from 'typeorm'

export class deletePayouts1639326324737 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payouts')
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
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
  }
}
