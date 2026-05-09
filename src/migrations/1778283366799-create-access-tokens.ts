import { type MigrationInterface, type QueryRunner, Table } from 'typeorm'

export class createAccessTokens1778283366799 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'access_tokens',
      columns: [{
        name: 'id',
        type: 'varchar(255)',
        isPrimary: true
      }, {
        name: 'access_token',
        type: 'text'
      }, {
        name: 'refresh_token',
        type: 'text'
      }, {
        name: 'token_type',
        type: 'varchar(255)'
      }, {
        name: 'expires_in',
        type: 'int'
      }, {
        name: 'id_token',
        type: 'text'
      }, {
        name: 'scope',
        type: 'varchar(255)'
      }]
    }))
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('access_tokens')
  }
}
