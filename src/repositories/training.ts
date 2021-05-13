import BaseRepository, { BaseScopes } from './base'
import { EntityRepository } from 'typeorm'
import { Training } from '../entities'

@EntityRepository(Training)
export default class TrainingRepository extends BaseRepository<Training> {
  get scopes (): TrainingScopes {
    return new TrainingScopes(this, this.createQueryBuilder('training'))
  }
}

export class TrainingScopes extends BaseScopes<Training> {
  get default (): this {
    return this
      .leftJoinAndSelect('training.type', 'type')
      .leftJoinAndSelect('training_cancellations', 'cancellation', 'cancellation.trainingId = training.id')
      .andWhere('cancellation.id IS NULL')
      .andWhere('training.date > NOW() - INTERVAL \'15 minutes\'')
  }
}
