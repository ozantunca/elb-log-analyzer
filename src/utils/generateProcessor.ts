import { some, chain, map, isEmpty, values, pick } from 'lodash'

import { parseLine } from './parseLine'
import { filterByDate } from './filter'
import { ParserOptions } from '../types/library'

// sort while inserting
function splice(lines: string[][], newLine: string[], sortBy: number) {
  let len = lines.length
  let compare

  while (len--) {
    if (typeof lines[len][sortBy] === 'number' && typeof newLine[sortBy] === 'number') {
      compare = lines[len][sortBy] < newLine[sortBy] ? -1 : 1
    } else {
      compare = String(lines[len][sortBy]).localeCompare(newLine[sortBy])
    }

    if (compare < 0) {
      break
    }
  }

  lines.splice(len + 1, 0, newLine)
  return lines
}

interface ProcessorType {
  process(filterFunc: Function | null, line: string): void
  getResults(): string[][]
}

export function generateProcessor({
  requestedColumns,
  sortBy,
  ascending,
  limit,
  prefixes,
  start,
  end,
}: ParserOptions): ProcessorType {
  const COUNT_INDEX = requestedColumns.indexOf('count')

  if (COUNT_INDEX > -1) {
    const counts: { [key: string]: number } = {}
    const tempCols = requestedColumns.slice(0)

    tempCols.splice(COUNT_INDEX, 1)

    return {
      process(filterFunc, line) {
        if (isEmpty(line)) {
          return
        }

        const parsedLineAsObject = parseLine(line)

        if (!parsedLineAsObject) {
          return
        }

        // filter lines by date if requested
        if ((start || end) && filterByDate(parsedLineAsObject, start, end)) {
          return
        }

        const parsedLineWithRequestedColumns = values(pick(parsedLineAsObject, tempCols))

        // Drop the line if any of the columns requested does not exist in this line
        if (some(parsedLineWithRequestedColumns, (column: any) => !column && column !== '0')) {
          return
        }

        // Count column is not in 'line' at this moment
        // so we are defining a new variable that includes it
        if (filterFunc && !filterFunc(parsedLineWithRequestedColumns)) {
          return
        }

        // stringifying columns serves as a multi-column group_by
        const LINESTRING = JSON.stringify(parsedLineWithRequestedColumns)
        counts[LINESTRING] = counts[LINESTRING] ? counts[LINESTRING] + 1 : 1
      },

      getResults() {
        let q = chain(counts)
          .toPairs()
          .map(function ([key, countNumber]: [string, number]) {
            const line = JSON.parse(key)
            line.splice(COUNT_INDEX, 0, countNumber)
            return line
          })

        if (prefixes && prefixes[COUNT_INDEX]) {
          q = q.filter((line: string) =>
            line[COUNT_INDEX].toString().startsWith(prefixes[COUNT_INDEX])
          )
        }

        return q.sortBy(sortBy.toString()).value()
      },
    }
  } else {
    const temporaryColumns = requestedColumns.slice(0)
    let outputLines: string[][] = []

    return {
      process(filterFunc, line) {
        let lineObj: any = parseLine(line)

        // filter lines by date if requested
        if ((start || end) && filterByDate(lineObj, start, end)) {
          return
        }

        lineObj = map(temporaryColumns, (column: string) => lineObj[column])

        // Drop the line if any of the columns requested does not exist in this line
        if (some(lineObj, (column: string) => !column && column !== '0')) {
          return
        }

        if (filterFunc && !filterFunc(lineObj)) {
          return
        }

        // Add lines until the limit is reached
        if (outputLines.length < limit) {
          outputLines = splice(outputLines, lineObj, sortBy)
          return
        }

        // Drop lines immediately that are below the last item
        // of currently sorted list. Otherwise add them and
        // drop the last item.
        let compare: string | number | undefined
        const firstLine = outputLines[0]

        if (firstLine) {
          if (typeof firstLine[sortBy] === 'number' && typeof lineObj[sortBy] === 'number') {
            compare = firstLine[sortBy] < lineObj[sortBy] ? -1 : 1
          } else {
            compare = String(firstLine[sortBy]).localeCompare(lineObj[sortBy])
          }
        }

        if ((!ascending && compare === 1) || (ascending && compare === -1)) {
          return
        }

        outputLines = splice(outputLines, lineObj, sortBy)
        outputLines.shift()
      },

      getResults() {
        return outputLines
      },
    }
  }
}
