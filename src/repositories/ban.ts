import { EntityRepository, Repository } from 'typeorm'
import { Ban } from '../entities'
import { BaseScopes } from './base'

export class BanScopes extends BaseScopes<Ban> {
  get default (): BanScopes {
    return this
  }

  // get finished (): SelectQueryBuilder<Ban> {
  //   return this.andWhere()
  // }
}

@EntityRepository(Ban)
export default class BanRepository extends Repository<Ban> {
  get scopes (): BanScopes {
    return new BanScopes(this.createQueryBuilder('ban'))
  }
}
