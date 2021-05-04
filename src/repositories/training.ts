import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import { Training } from '../entities'

class TrainingScopes extends SelectQueryBuilder<Training> {

}

@EntityRepository(Training)
export default class TrainingRepository extends Repository<Training> {
  get scopes (): TrainingScopes {
    return new TrainingScopes(this.createQueryBuilder('training'))
  }
}
