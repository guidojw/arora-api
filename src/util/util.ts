export type Range = [number | undefined, number] | [number, number?] | number

export function inRange (value: number, range: Range): boolean {
  return typeof range === 'number'
    ? range === value
    : (range[0] ?? 0) <= value && value <= (range[1] ?? 255)
}

// groupBy that preserves the records' order by returning an array instead of an object.
export function groupBy<T> (records: T[], key: string): T[][] {
  const result: T[][] = []
  for (const record of records) {
    const recordGroup = result.find(group => (group[0] as any)[key] === (record as any)[key])
    if (typeof recordGroup === 'undefined') {
      result.push([record])
    } else {
      recordGroup.push(record)
    }
  }
  return result
}
