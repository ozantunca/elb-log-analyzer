import every from 'lodash/every'

export function filterByDate(line: { timestamp: string }, start?: Date, end?: Date) {
  const timestamp = new Date(line.timestamp).getTime()

  if (start && start.getTime() > timestamp) {
    return true
  }

  if (end && end.getTime() < timestamp) {
    return true
  }

  return false
}

// Generates a filter function depending on prefixes
export function generateFilter(prefixes: string[], cols: string[]): Function | null {
  const indexOfCountColumn = cols.indexOf('count')

  if (indexOfCountColumn > -1) {
    prefixes.splice(indexOfCountColumn, 1)
  }

  if (prefixes.length === 0) {
    return null
  }

  return (line: string[]) =>
    every(
      prefixes,
      (prefix, i) =>
        (!prefix && prefix !== '0') || // no prefix for this index
        (line[i] && // line has value in that index
          line[i].toString().startsWith(prefix)) // line startsWith given prefix
    )
}
