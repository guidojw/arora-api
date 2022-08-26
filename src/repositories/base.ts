import * as lodash from 'lodash'
import { type ClassConstructor, plainToInstance } from 'class-transformer'
import { type ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'
import { util } from '../util'

const { groupBy } = util

export abstract class BaseRepositoryProperties<T> {
  public abstract transform (record: any): T
  public abstract transformMany (records: any[]): T[]
  public abstract _transform (record: any): T
  public abstract _transformMany (records: any[]): T[]
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  _transform<T> (record: any): T {
    return plainToInstance(
      this.target as ClassConstructor<T>,
      record,
      { excludeExtraneousValues: true }
    )
  },

  _transformMany<T> (records: any[]): T[] {
    return groupBy(records, 'id')
      .map(groupedRecords => groupedRecords.map(this.transform.bind(this)))
      .map(([first, ...rest]) => lodash.mergeWith(first, ...rest, (objValue: any, srcValue: any) => (
        Array.isArray(objValue) ? objValue.concat(srcValue) : undefined
      )))
  }
} as Repository<any> & BaseRepositoryProperties<any>

export abstract class BaseScopes<T> extends SelectQueryBuilder<T> {
  public static readonly scopes: string[] = []

  public constructor (
    private readonly repository: Repository<T> & BaseRepositoryProperties<T>,
    queryBuilder: SelectQueryBuilder<T>
  ) {
    super(queryBuilder)
  }

  public abstract get default (): this

  public static has (scopes?: string[]): boolean {
    if (typeof scopes === 'undefined') {
      return true
    }
    return scopes.every(scope => scope === 'default' || this.scopes.includes(scope))
  }

  public apply (scopes?: string[]): this {
    if (typeof scopes === 'undefined') {
      return this.default
    }
    return scopes.reduce((qb, scope) => {
      if (scope !== 'default' && !(this.constructor as typeof BaseScopes).scopes.includes(scope)) {
        throw new Error(`Invalid scope "${scope}" called`)
      }
      // @ts-expect-error
      return qb[scope]
    }, this)
  }

  public override async getMany (): Promise<T[]> {
    return this.repository.transformMany(await super.getRawMany())
  }

  public override async getOne (): Promise<T | null> {
    return this.repository.transformMany(await super.getRawMany()).shift() ?? null
  }

  public override leftJoin (
    entityOrProperty: ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>) | string | Function,
    alias: string,
    condition?: string,
    parameters?: ObjectLiteral
  ): this {
    if (this.expressionMap.joinAttributes.some(attribute => attribute.entityOrProperty === entityOrProperty)) {
      return this
    }
    return super.leftJoin(entityOrProperty, alias, condition, parameters)
  }

  public override leftJoinAndSelect (
    entityOrProperty: ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>) | string | Function,
    alias: string,
    condition?: string,
    parameters?: ObjectLiteral
  ): this {
    if (this.expressionMap.joinAttributes.some(attribute => attribute.entityOrProperty === entityOrProperty)) {
      return this
    }
    return super.leftJoinAndSelect(entityOrProperty, alias, condition, parameters)
  }
}
