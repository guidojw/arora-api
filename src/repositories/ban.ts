import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import { Ban } from '../entities'
import { BaseScopes } from './base'

export class BanScopes extends BaseScopes<Ban> {
  get default (): SelectQueryBuilder<Ban> {
    return this
  }

  // get finished (): SelectQueryBuilder<Ban> {
  //   return this.andWhere()
  // }
}

@EntityRepository(Ban)
export default class BanRepository extends Repository<Ban> {
  get scoped (): BanScopes {
    return new BanScopes(this.createQueryBuilder('ban'))
  }
}
