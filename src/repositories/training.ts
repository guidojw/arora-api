import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm'
import { Training } from '../entities'

class TrainingScopes extends SelectQueryBuilder<Training> {
  get default (): SelectQueryBuilder<Training> {
    return this
      .leftJoinAndSelect('training.type', 'type')
      .leftJoinAndSelect('training_cancellations', 'cancellation', 'cancellation.trainingId = training.id')
      .where('cancellation.id IS NULL')
      .andWhere('training.date > NOW() - INTERVAL \'15 minutes\'')
  }
}

@EntityRepository(Training)
export default class TrainingRepository extends Repository<Training> {
  get scopes (): TrainingScopes {
    return new TrainingScopes(this.createQueryBuilder('training'))
  }
}
