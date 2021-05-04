import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import { Ban } from '../entities'

class BanScopes extends SelectQueryBuilder<Ban> {
  // get finished (): BanScopes {
  //   return this.andWhere()
  // }
}

@EntityRepository(Ban)
export default class BanRepository extends Repository<Ban> {
  get scoped (): BanScopes {
    return new BanScopes(this.createQueryBuilder('ban'))
  }
}
