import { EntityRepository, Repository } from 'typeorm'
import { BaseScopes } from './base'
import { Training } from '../entities'

export class TrainingScopes extends BaseScopes<Training> {
  get default (): TrainingScopes {
    return this
      .leftJoinAndSelect('training.type', 'type')
      .leftJoinAndSelect('training_cancellations', 'cancellation', 'cancellation.trainingId = training.id')
      .andWhere('cancellation.id IS NULL')
      .andWhere('training.date > NOW() - INTERVAL \'15 minutes\'')
  }
}

@EntityRepository(Training)
export default class TrainingRepository extends Repository<Training> {
  get scopes (): TrainingScopes {
    return new TrainingScopes(this.createQueryBuilder('training'))
  }
}
