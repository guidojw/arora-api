import { type BaseRepositoryProperties, BaseScopes } from './base'
import type { Repository } from 'typeorm'
import { Training } from '../entities'

abstract class TrainingRepositoryProperties {
  public abstract scopes (): TrainingScopes
  public abstract transform (record: any): Training
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  scopes (): TrainingScopes {
    return new TrainingScopes(this, this.createQueryBuilder('training'))
  },

  transform (record: any): Training {
    record.type = record.type_id == null
      ? record.type_id
      : {
          id: record.type_id,
          abbreviation: record.type_abbreviation,
          group_id: record.type_group_id,
          name: record.type_name
        }
    return this._transform(record)
  }
} as Repository<Training> & BaseRepositoryProperties<Training> & TrainingRepositoryProperties

export class TrainingScopes extends BaseScopes<Training> {
  public get default (): this {
    return this
      .addSelect('training.*')
      .leftJoinAndSelect('training.type', 'type')
      .leftJoin('training_cancellations', 'cancellation', 'cancellation.training_id = training.id')
      .andWhere('cancellation.id IS NULL')
      .andWhere('training.date > NOW() - INTERVAL \'15 minutes\'')
  }
}
