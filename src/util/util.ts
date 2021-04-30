export type Range = [number | undefined, number] | [number, number | undefined] | number

export function inRange (value: number, range: Range): boolean {
  return typeof range === 'number'
    ? range === value
    : (range[0] ?? 0) <= value && value <= (range[1] ?? 255)
}
