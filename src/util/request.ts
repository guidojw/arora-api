import { Model } from 'sequelize'

export type ScopeQuery = string[] | undefined
export type SortQueryTuple = [string, 'ASC' | 'DESC']
export type SortQuery = SortQueryTuple[] | undefined

export function decodeScopeQueryParam (param = ''): ScopeQuery {
  const result = param
    .split(',')
    .filter(value => value !== '')

  return result.length > 0
    ? result
    : undefined
}

export function decodeSortQueryParam (param = ''): SortQuery {
  const result = param
    .split(',')
    .filter(value => value !== '')
    .map(sort => {
      if (sort.charAt(0) === '-') {
        return [sort.substring(1), 'DESC'] as SortQueryTuple
      } else {
        return [sort, 'ASC'] as SortQueryTuple
      }
    })

  return result.length > 0
    ? result
    : undefined
}

export function hasScopes (model: typeof Model, scopes: ScopeQuery): boolean {
  if (typeof scopes === 'undefined') {
    return true
  }
  const modelScopes = ['defaultScope', ...Object.keys(model.options.scopes ?? [])]
  return scopes.every(scope => modelScopes.includes(scope))
}
