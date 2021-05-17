import BaseRepository, { BaseScopes } from './base'
import { EntityRepository, SelectQueryBuilder } from 'typeorm'
import { Ban } from '../entities'

const endsAtLiteral = 'date + ' +
  '(ban.duration||\' milliseconds\')::INTERVAL + ' +
  '(COALESCE(SUM(extension.duration), 0)||\' milliseconds\')::INTERVAL'

@EntityRepository(Ban)
export default class BanRepository extends BaseRepository<Ban> {
  get scopes (): BanScopes {
    return new BanScopes(this, this.createQueryBuilder('ban'))
  }

  transform (record: any): Ban {
    if (record.extension_id != null) {
      record.extensions = [{
        id: record.extension_id,
        author_id: record.extension_author_id,
        ban_id: record.extension_ban_id,
        duration: record.extension_duration,
        reason: record.extension_reason
      }]
    }
    return super.transform(record)
  }
}

export class BanScopes extends BaseScopes<Ban> {
  static scopes = ['finished']

  get default (): this {
    return this
      .addSelect('ban.*')
      .addSelect('other_ban.ends_at')
      .leftJoin('ban_cancellations', 'cancellation', 'cancellation.ban_id = ban.id')
      .leftJoin(BanScopes.makeEndsAtQueryBuilder, 'other_ban', 'other_ban.id = ban.id')
      .leftJoinAndSelect('ban_extensions', 'extension', 'extension.ban_id = ban.id')
      .andWhere('cancellation.id IS NULL')
      .addGroupBy('ban.id')
      .addGroupBy('extension.id')
      .addGroupBy('other_ban.ends_at')
      .orHaving('(ban.duration IS NULL OR other_ban.ends_at > NOW())')
  }

  get finished (): this {
    return this
      .addSelect('ban.*')
      .addSelect('other_ban.ends_at')
      .leftJoin('ban_cancellations', 'cancellation', 'cancellation.ban_id = ban.id')
      .leftJoin(BanScopes.makeEndsAtQueryBuilder, 'other_ban', 'other_ban.id = ban.id')
      .leftJoinAndSelect('ban_extensions', 'extension', 'extension.ban_id = ban.id')
      .andWhere('cancellation.id IS NULL')
      .addGroupBy('ban.id')
      .addGroupBy('extension.id')
      .addGroupBy('other_ban.ends_at')
      .orHaving('(ban.duration IS NULL OR other_ban.ends_at <= NOW())')
  }

  private static makeEndsAtQueryBuilder (qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    // Connection is somehow undefined on this qb, and repository is a connection instance so weird fix but works?
    // @ts-expect-error
    qb.connection = qb.repository
    return qb
      .select(endsAtLiteral, 'ends_at')
      .addSelect('ban.id', 'id')
      .from('bans', 'ban')
      .addFrom('ban_extensions', 'extension')
      .groupBy('ban.id')
      .addGroupBy('ban.date')
  }
}
