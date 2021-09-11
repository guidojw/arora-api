import BaseRepository, { BaseScopes } from './base'
import { EntityRepository, SelectQueryBuilder } from 'typeorm'
import { Ban } from '../entities'

@EntityRepository(Ban)
export default class BanRepository extends BaseRepository<Ban> {
  public get scopes (): BanScopes {
    return new BanScopes(this, this.createQueryBuilder('ban'))
  }

  public override transform (record: any): Ban {
    if (typeof record.extension_id !== 'undefined') {
      record.extensions = record.extension_id === null
        ? []
        : [{
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
  public static override readonly scopes = ['finished']

  public get default (): this {
    return this
      .makeBaseScope()
      .orHaving('(ban.duration IS NULL OR other_ban.ends_at > NOW())')
  }

  public get finished (): this {
    return this
      .makeBaseScope()
      .orHaving('(ban.duration IS NULL OR other_ban.ends_at <= NOW())')
  }

  private makeBaseScope (): this {
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
  }

  private static makeEndsAtQueryBuilder (qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
    // Connection is somehow undefined on this qb, and repository is a connection instance so weird fix but works?
    // @ts-expect-error
    qb.connection = qb.repository
    return qb
      .select('ban.id', 'id')
      .addSelect(
        'ban.date + ((ban.duration + COALESCE(SUM(extension.duration), 0)) / 1000||\' seconds\')::INTERVAL',
        'ends_at'
      )
      .from('bans', 'ban')
      .leftJoin('ban_extensions', 'extension', 'extension.ban_id = ban.id')
      .groupBy('ban.id')
      .addGroupBy('ban.date')
  }
}
