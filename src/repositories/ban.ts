import { type BaseRepositoryProperties, BaseScopes } from './base'
import type { Repository, SelectQueryBuilder } from 'typeorm'
import { Ban } from '../entities'

abstract class BanRepositoryProperties {
  public abstract scopes (): BanScopes
  public abstract transform (record: any): Ban
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  scopes (): BanScopes {
    // @ts-expect-error
    return new BanScopes(this.createQueryBuilder('ban'), null, this)
  },

  transform (record: any): Ban {
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
    return this._transform(record)
  }
} as Repository<Ban> & BaseRepositoryProperties<Ban> & BanRepositoryProperties

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
