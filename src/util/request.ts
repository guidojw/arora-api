export type SortQueryTuple = [string, 'ASC' | 'DESC']
export type SortQuery = SortQueryTuple[]

export function decodeScopeQueryParam (param = ''): string[] | undefined {
  const result = param
    .split(',')
    .filter(value => value !== '')

  return result.length > 0
    ? result
    : undefined
}

export function decodeSortQueryParam (param = ''): SortQuery | undefined {
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
