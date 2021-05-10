import { SelectQueryBuilder } from 'typeorm'

export abstract class BaseScopes<T> extends SelectQueryBuilder<T> {
  static scopes: string[] = []

  static has (scopes?: string[]): boolean {
    if (typeof scopes === 'undefined') {
      return true
    }

    return scopes.every(scope => scope === 'default' || this.scopes.includes(scope))
  }

  apply (scopes?: string[]): BaseScopes<T> {
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

  abstract get default (): BaseScopes<T>
}