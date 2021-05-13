import BaseRepository, { BaseScopes } from './base'
import { Ban } from '../entities'
import { EntityRepository } from 'typeorm'

const endsAtLiteral = 'date + ' +
  '(ban.duration||\' milliseconds\')::INTERVAL + ' +
  '(COALESCE(SUM(extension.duration), 0)||\' milliseconds\')::INTERVAL'

@EntityRepository(Ban)
export default class BanRepository extends BaseRepository<Ban> {
  get scopes (): BanScopes {
    return new BanScopes(this, this.createQueryBuilder('ban'))
  }

  transform (record: any): Ban {
    record.extensions = []
    if (record.extension_id !== null) {
      record.extensions.push({
        id: record.extension_id,
        author_id: record.extension_author_id,
        ban_id: record.extension_ban_id,
        duration: record.extension_duration,
        reason: record.extension_reason
      })
    }
    return super.transform(record)
  }
}

export class BanScopes extends BaseScopes<Ban> {
  static scopes = ['finished']

  get default (): this {
    return this
      .select(`ban.*, ${endsAtLiteral} AS ends_at`)
      .leftJoinAndSelect('ban_cancellations', 'cancellation', 'cancellation.banId = ban.id')
      .leftJoinAndSelect('ban_extensions', 'extension', 'extension.banId = ban.id')
      .andWhere('cancellation.id IS NULL')
      .addGroupBy('ban.id')
      .addGroupBy('cancellation.id')
      .addGroupBy('extension.id')
      .andHaving(`ban.duration IS NULL OR ${endsAtLiteral} > NOW()`)
  }

  get finished (): this {
    return this
      .select(`ban.*, ${endsAtLiteral} AS ends_at`)
      .leftJoinAndSelect('ban_cancellations', 'cancellation', 'cancellation.banId = ban.id')
      .leftJoinAndSelect('ban_extensions', 'extension', 'extension.banId = ban.id')
      .andWhere('cancellation.id IS NULL')
      .addGroupBy('ban.id')
      .addGroupBy('cancellation.id')
      .addGroupBy('extension.id')
      .andHaving(`ban.duration IS NULL OR ${endsAtLiteral} <= NOW()`)
  }
}
