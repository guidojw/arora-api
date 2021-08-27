import type { Factory, Seeder } from '@zchapple/typeorm-seeding'
import type { Connection } from 'typeorm'
import { Payout } from '../entities'

export default class CreatePayout implements Seeder {
  public async run (_factory: Factory, connection: Connection): Promise<any> {
    console.log(connection.getRepository(Payout))
  }
}
