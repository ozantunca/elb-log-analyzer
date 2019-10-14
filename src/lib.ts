import fs from 'fs'
import readline from 'readline'
import _ from 'lodash'
import { promisify } from 'util'
import { parse } from 'url'
import { ParserOptions, LibraryOptions, ParsedLine } from './types/library'

const glob: Function = promisify(require('glob'))
const ALL_FIELDS = [
  'type',
  'timestamp',
  'elb',
  'client:port',
  'client',
  'backend:port',
  'backend',
  'request_processing_time',
  'backend_processing_time',
  'response_processing_time',
  'elb_status_code',
  'backend_status_code',
  'received_bytes',
  'sent_bytes',
  'request',
  'requested_resource',
  'user_agent',
  'total_time',
  'count',
  'target_group_arn',
  'trace_id',
  'ssl_cipher',
  'ssl_protocol',
  'requested_resource.pathname',
  'requested_resource.host',
  'requested_resource.protocol',
  'requested_resource.port',
  'requested_resource.hostname',
  'requested_resource.path',
  'requested_resource.origin',
  'requested_resource.search',
  'requested_resource.href',
  'requested_resource.hash',
  'requested_resource.searchParams',
  'requested_resource.username',
  'requested_resource.password',
]

export default async function({
  files = [],
  cols = ['count', 'requested_resource'],
  prefixes = [],
  sortBy = 0,
  limit = 10,
  ascending = false,
  start,
  end,
  onProgress = () => {},
  onStart = () => {},
}: LibraryOptions) {
  // collect file names
  return Promise.all(
    _.map(files, async (fileName: string) => {
      let fileList: string[] = await glob(fileName + '/**/*', { nodir: true })
      if (!fileList || !fileList.length) {
        fileList = await glob(fileName, { nodir: true })

        if (!fileList || !fileList.length) {
          throw new Error(`No file with name '${fileName}' found.`)
        }
      }
      return fileList
    })
  ).then(results => {
    const fileNames = _.flatten(results)

    onStart(fileNames)

    // Fail when user requests a column that is not support by the analyzer
    if (cols.some(column => !~ALL_FIELDS.indexOf(column))) {
      throw new Error('One or more of the requested columns does not exist.')
    }

    // Fail when user gives a sortBy value for a non-existent column
    if (sortBy < 0 || sortBy > cols.length - 1) {
      throw new Error(
        "Invalid 'sortBy' parameter. 'sortBy' cannot be lower than 0 or greater than number of columns."
      )
    }

    const processor = generateProcessor({
      requestedColumns: cols,
      sortBy,
      limit,
      ascending,
      prefixes,
      start,
      end,
    })

    const filterFunc = generateFilter(prefixes.slice(), cols)

    return parseFiles(fileNames, processor.process.bind(processor, filterFunc), onProgress).then(
      function() {
        let logs = processor.getResults()

        if (ascending) {
          logs = logs.slice(0, limit)
        } else {
          logs = logs.slice(logs.length > limit ? logs.length - limit : 0).reverse()
        }
        return logs
      }
    )
  })
}

// Reads files line by line and passes them
// to the processor function
function parseFiles(fileNames: string[], processFunc: Function, onProgress: Function) {
  return Promise.all(
    _.map(
      fileNames,
      (fileName: string) =>
        new Promise((resolve: Function) => {
          const RL = readline.createInterface({
            terminal: false,
            input: fs.createReadStream(fileName),
          })

          // Read file contents
          RL.on('line', (line: string) => {
            processFunc(line)
          })

          RL.on('close', () => {
            onProgress()
            resolve()
          })
        })
    )
  )
}

// Generates a filter function depending on prefixes
function generateFilter(prefixes: string[], cols: string[]): Function | null {
  const COUNT_INDEX = cols.indexOf('count')

  if (COUNT_INDEX > -1) {
    prefixes.splice(COUNT_INDEX, 1)
  }

  if (prefixes.length === 0) {
    return null
  }

  return (line: string[]) =>
    _.every(
      prefixes,
      (prefix, i) =>
        (!prefix && prefix !== '0') || // no prefix for this index
        (line[i] && // line has value in that index
          line[i].toString().startsWith(prefix)) // line startsWith given prefix
    )
}

interface ProcessorType {
  process(filterFunc: Function | null, line: string): void
  getResults(): string[][]
}

function generateProcessor({
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
        if (_.isEmpty(line)) {
          return
        }

        const parsedLineAsObject: ParsedLine | undefined = parseLine(line)

        if (!parsedLineAsObject) {
          return
        }

        // filter lines by date if requested
        if ((start || end) && filterByDate(parsedLineAsObject, start, end)) {
          return
        }

        const parsedLineWithRequestedColumns = _.values(_.pick(parsedLineAsObject, tempCols))

        // Drop the line if any of the columns requested does not exist in this line
        if (_.some(parsedLineWithRequestedColumns, (column: any) => !column && column !== '0')) {
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
        let q = _.chain(counts)
          .toPairs()
          .map(function([key, countNumber]: [string, number]) {
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

        lineObj = _.map(temporaryColumns, (column: string) => lineObj[column])

        // Drop the line if any of the columns requested does not exist in this line
        if (lineObj.some((column: string) => !column && column !== '0')) {
          return
        }

        if (filterFunc && !filterFunc(lineObj)) {
          return
        }

        const FIRSTLINE = _.first(outputLines)

        // Add lines until the limit is reached
        if (outputLines.length < limit) {
          outputLines = splice(outputLines, lineObj, sortBy)
        } else {
          // Drop lines immediately that are below the last item
          // of currently sorted list. Otherwise add them and
          // drop the last item.
          let compare

          if (FIRSTLINE) {
            if (typeof FIRSTLINE[sortBy] === 'number' && typeof lineObj[sortBy] === 'number') {
              compare = FIRSTLINE[sortBy] < lineObj[sortBy] ? -1 : 1
            } else {
              compare = String(FIRSTLINE[sortBy]).localeCompare(lineObj[sortBy])
            }
          }

          if ((!ascending && compare === 1) || (ascending && compare === -1)) {
            return
          }

          outputLines = splice(outputLines, lineObj, sortBy)
          outputLines.shift()
        }
      },

      getResults() {
        return outputLines
      },
    }
  }
}

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

// line parser function
// @todo: will be customisable to be used for logs other than ELB's
function parseLine(line: string): ParsedLine | undefined {
  const ATTRIBUTES = line.match(/[^\s"']+|"([^"]*)"/gi)
  if (!ATTRIBUTES) {
    return
  }

  let type: string | undefined

  if (isNaN(new Date(ATTRIBUTES[0]).getTime())) {
    type = ATTRIBUTES.shift()
  }

  const requested_resource = String(ATTRIBUTES[11]).split(' ')[1]
  const parsedURL = _.pick(parse(requested_resource), [
    'pathname',
    'host',
    'protocol',
    'port',
    'hostname',
    'path',
    'origin',
    'search',
    'href',
    'hash',
    'searchParams',
    'username',
    'password',
  ])

  const parsedLine: ParsedLine = {
    timestamp: ATTRIBUTES[0],
    elb: ATTRIBUTES[1],
    client: String(ATTRIBUTES[2]).split(':')[0],
    'client:port': ATTRIBUTES[2],
    backend: String(ATTRIBUTES[3]).split(':')[0],
    'backend:port': ATTRIBUTES[3],
    request_processing_time: Number(ATTRIBUTES[4]),
    backend_processing_time: Number(ATTRIBUTES[5]),
    response_processing_time: Number(ATTRIBUTES[6]),
    elb_status_code: ATTRIBUTES[7],
    backend_status_code: ATTRIBUTES[8],
    received_bytes: ATTRIBUTES[9],
    sent_bytes: ATTRIBUTES[10],
    request: ATTRIBUTES[11],
    requested_resource,
    ..._.reduce(
      parsedURL,
      (merged, current, key) => ({
        ...merged,
        [`requested_resource.${key}`]: current,
      }),
      {}
    ),
    user_agent: ATTRIBUTES[12],
    total_time: Number(ATTRIBUTES[4]) + Number(ATTRIBUTES[5]) + Number(ATTRIBUTES[6]),
    ssl_cipher: ATTRIBUTES[13],
    ssl_protocol: ATTRIBUTES[14],
    target_group_arn: ATTRIBUTES[15],
    trace_id: ATTRIBUTES[16],
    type,
  }

  return parsedLine
}

function filterByDate(line: { timestamp: string }, start?: Date, end?: Date) {
  const timestamp = new Date(line.timestamp).getTime()

  if (start && start.getTime() > timestamp) {
    return true
  }

  if (end && end.getTime() < timestamp) {
    return true
  }

  return false
}
