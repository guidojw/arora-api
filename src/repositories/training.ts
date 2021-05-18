import BaseRepository, { BaseScopes } from './base'
import { EntityRepository } from 'typeorm'
import { Training } from '../entities'

@EntityRepository(Training)
export default class TrainingRepository extends BaseRepository<Training> {
  get scopes (): TrainingScopes {
    return new TrainingScopes(this, this.createQueryBuilder('training'))
  }

  transform (record: any): Training {
    record.type = record.type_id == null
      ? record.type_id
      : {
          id: record.type_id,
          abbreviation: record.type_abbreviation,
          group_id: record.type_group_id,
          name: record.type_name
        }
    return super.transform(record)
  }
}

export class TrainingScopes extends BaseScopes<Training> {
  get default (): this {
    return this
      .addSelect('training.*')
      .leftJoinAndSelect('training.type', 'type')
      .leftJoin('training_cancellations', 'cancellation', 'cancellation.training_id = training.id')
      .andWhere('cancellation.id IS NULL')
      .andWhere('training.date > NOW() - INTERVAL \'15 minutes\'')
  }
}
