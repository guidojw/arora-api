import * as lodash from 'lodash'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'

export default abstract class BaseRepository<T> extends Repository<T> {
  transform (record: any): T {
    return plainToClass(
      this.target as ClassConstructor<T>,
      record,
      { excludeExtraneousValues: true }
    )
  }

  transformMany (records: any[]): T[] {
    return Object.values(lodash.groupBy(records, 'id'))
      .map(groupedRecords => groupedRecords.map(this.transform.bind(this)))
      .map(([first, ...rest]) => lodash.merge(first, ...rest))
  }
}

export abstract class BaseScopes<T> extends SelectQueryBuilder<T> {
  static scopes: string[] = []

  constructor (private readonly repository: BaseRepository<T>, queryBuilder: SelectQueryBuilder<T>) {
    super(queryBuilder)
  }

  abstract get default (): this

  static has (scopes?: string[]): boolean {
    if (typeof scopes === 'undefined') {
      return true
    }
    return scopes.every(scope => scope === 'default' || this.scopes.includes(scope))
  }

  apply (scopes?: string[]): this {
    if (typeof scopes === 'undefined') {
      return this.default
    }
    return scopes.reduce((qb, scope) => {
      if (scope !== 'default' && !BaseScopes.scopes.includes(scope)) {
        throw new Error(`Invalid scope "${scope}" called`)
      }
      // @ts-expect-error
      return qb[scope]
    }, this)
  }

  async getOne (): Promise<T | undefined> {
    const record = await super.getRawOne()
    if (typeof record === 'undefined') {
      return undefined
    }
    return this.repository.transform(record)
  }

  async getMany (): Promise<T[]> {
    return this.repository.transformMany(await super.getRawMany())
  }

  // @ts-expect-error
  leftJoinAndSelect (property: string, alias: string, condition?: string, parameters?: ObjectLiteral): this {
    if (this.expressionMap.joinAttributes.some(attribute => attribute.entityOrProperty === property)) {
      return this
    }
    return super.leftJoinAndSelect(property, alias, condition, parameters)
  }
}
