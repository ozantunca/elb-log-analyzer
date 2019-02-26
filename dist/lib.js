"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _readline = _interopRequireDefault(require("readline"));

var _underscore = _interopRequireDefault(require("underscore"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const glob = _bluebird.default.promisify(require('glob'));

const ALL_FIELDS = ['type', 'timestamp', 'elb', 'client:port', 'client', 'backend:port', 'backend', 'request_processing_time', 'backend_processing_time', 'response_processing_time', 'elb_status_code', 'backend_status_code', 'received_bytes', 'sent_bytes', 'request', 'requested_resource', 'user_agent', 'total_time', 'count', 'target_group_arn', 'trace_id', 'ssl_cipher', 'ssl_protocol'];

async function _default({
  files = [],
  cols = ['count', 'requested_resource'],
  prefixes = [],
  sortBy = 0,
  limit = 10,
  ascending = false,
  start,
  end,
  onProgress = () => {},
  onStart = () => {}
}) {
  // collect file names
  return _bluebird.default.map(files, async fileName => {
    let fileList = await glob(fileName + '/**/*', {
      nodir: true
    });

    if (!fileList || !fileList.length) {
      fileList = await glob(fileName, {
        nodir: true
      });

      if (!fileList || !fileList.length) {
        throw new Error(`No file with name '${fileName}' found.`);
      }
    }

    return fileList;
  }).then(results => {
    const fileNames = _underscore.default.flatten(results); // Processing starts


    onStart(fileNames); // Fail when user requests a column that is not support by the analyzer

    if (cols.some(c => !~ALL_FIELDS.indexOf(c))) {
      throw new Error('One or more of the requested columns does not exist.');
    } // Fail when user gives a sortBy value for a non-existent column


    if (sortBy < 0 || sortBy > cols.length - 1) {
      throw new Error('Invalid \'sortBy\' parameter. \'sortBy\' cannot be lower than 0 or greater than number of columns.');
    }

    const processor = generateProcessor({
      requestedColumns: cols,
      sortBy,
      limit,
      ascending,
      prefixes,
      start,
      end
    });
    const filterFunc = generateFilter(prefixes.slice(), cols);
    return parseFiles(fileNames, processor.process.bind(processor, filterFunc), onProgress).then(function () {
      let logs = processor.getResults();

      if (ascending) {
        logs = logs.slice(0, limit);
      } else {
        logs = logs.slice(logs.length > limit ? logs.length - limit : 0).reverse();
      }

      return logs;
    });
  });
} // Reads files line by line and passes them
// to the processor function


function parseFiles(fileNames, processFunc, onProgress) {
  return _bluebird.default.map(fileNames, fileName => new _bluebird.default(pass => {
    const RL = _readline.default.createInterface({
      terminal: false,
      input: _fs.default.createReadStream(fileName)
    }); // Read file contents


    RL.on('line', line => {
      processFunc(line);
    });
    RL.on('close', () => {
      onProgress();
      pass();
    });
  }));
} // Generates a filter function depending on prefixes


function generateFilter(prefixes, cols) {
  const COUNT_INDEX = cols.indexOf('count');

  if (COUNT_INDEX > -1) {
    prefixes.splice(COUNT_INDEX, 1);
  }

  if (prefixes.length === 0) return null;
  return line => _underscore.default.every(prefixes, (p, i) => !p && p !== '0' || // no prefix for this index
  line[i] && // line has value in that index
  line[i].toString().startsWith(p) // line startsWith given prefix
  );
}

function generateProcessor({
  requestedColumns,
  sortBy,
  ascending,
  limit,
  prefixes,
  start,
  end
}) {
  const COUNT_INDEX = requestedColumns.indexOf('count');

  if (COUNT_INDEX > -1) {
    let counts = {};
    let tempCols = requestedColumns.slice(0);
    tempCols.splice(COUNT_INDEX, 1);
    return {
      process(filterFunc, line) {
        let lineObj = parseLine(line);

        if (!lineObj) {
          return;
        } // filter lines by date if requested


        if ((start || end) && filterByDate(lineObj, start, end)) {
          return;
        }

        lineObj = _underscore.default.map(tempCols, c => lineObj[c]); // Drop the line if any of the columns requested does not exist in this line

        if (lineObj.some(c => !c && c !== '0')) {
          return;
        } // Count column is not in 'line' at this moment
        // so we are defining a new variable that includes it


        if (filterFunc && !filterFunc(lineObj)) {
          return;
        } // stringifying columns serves as a multi-column group_by


        const LINESTRING = JSON.stringify(lineObj);
        counts[LINESTRING] = counts[LINESTRING] ? counts[LINESTRING] + 1 : 1;
      },

      getResults() {
        let q = _underscore.default.chain(counts).pairs().map(function (l) {
          const COUNT = l[1];
          l = JSON.parse(l[0]);
          l.splice(COUNT_INDEX, 0, COUNT);
          return l;
        });

        if (prefixes && prefixes[COUNT_INDEX]) {
          q = q.filter(line => line[COUNT_INDEX].toString().startsWith(prefixes[COUNT_INDEX]));
        }

        return q.sortBy(sortBy.toString()).value();
      }

    };
  } else {
    const TEMP_COLS = requestedColumns.slice(0);
    let outputLines = [];
    return {
      process(filterFunc, line) {
        let lineObj = parseLine(line); // filter lines by date if requested

        if ((start || end) && filterByDate(lineObj, start, end)) {
          return;
        }

        lineObj = _underscore.default.map(TEMP_COLS, c => lineObj[c]); // Drop the line if any of the columns requested does not exist in this line

        if (lineObj.some(c => !c && c !== '0')) {
          return;
        }

        if (filterFunc && !filterFunc(lineObj)) {
          return;
        }

        const FIRSTLINE = _underscore.default.first(outputLines); // Add lines until the limit is reached


        if (outputLines.length < limit) {
          outputLines = splice(outputLines, lineObj, sortBy);
        } // Drop lines immediately that are below the last item
        // of currently sorted list. Otherwise add them and
        // drop the last item.
        else {
            let compare;

            if (FIRSTLINE) {
              if (typeof FIRSTLINE[sortBy] === 'number' && typeof lineObj[sortBy] === 'number') {
                compare = FIRSTLINE[sortBy] < lineObj[sortBy] ? -1 : 1;
              } else {
                compare = String(FIRSTLINE[sortBy]).localeCompare(lineObj[sortBy]);
              }
            }

            if (!ascending && compare === 1 || ascending && compare === -1) {
              return;
            }

            outputLines = splice(outputLines, lineObj, sortBy);
            outputLines.shift();
          }
      },

      getResults() {
        return outputLines;
      }

    };
  }
} // sort while inserting


function splice(lines, newLine, sortBy) {
  let l = lines.length;
  let compare;

  while (l--) {
    if (typeof lines[l][sortBy] === 'number' && typeof newLine[sortBy] === 'number') {
      compare = lines[l][sortBy] < newLine[sortBy] ? -1 : 1;
    } else {
      compare = String(lines[l][sortBy]).localeCompare(newLine[sortBy]);
    }

    if (compare < 0) {
      break;
    }
  }

  lines.splice(l + 1, 0, newLine);
  return lines;
} // line parser function
// @todo: will be customisable to be used for logs other than ELB's


function parseLine(line) {
  if (!line || line == '') {
    return false;
  }

  const ATTRIBUTES = line.match(/[^\s"']+|"([^"]*)"/gi);
  let parsedLine = {};

  if (!ATTRIBUTES) {
    return false;
  }

  if (isNaN(new Date(ATTRIBUTES[0]).getTime())) {
    parsedLine.type = ATTRIBUTES.shift();
  }

  parsedLine = { ...parsedLine,
    'timestamp': ATTRIBUTES[0],
    'elb': ATTRIBUTES[1],
    'client': String(ATTRIBUTES[2]).split(':')[0],
    'client:port': ATTRIBUTES[2],
    'backend': String(ATTRIBUTES[3]).split(':')[0],
    'backend:port': ATTRIBUTES[3],
    'request_processing_time': ATTRIBUTES[4],
    'backend_processing_time': ATTRIBUTES[5],
    'response_processing_time': ATTRIBUTES[6],
    'elb_status_code': ATTRIBUTES[7],
    'backend_status_code': ATTRIBUTES[8],
    'received_bytes': ATTRIBUTES[9],
    'sent_bytes': ATTRIBUTES[10],
    'request': ATTRIBUTES[11],
    'requested_resource': String(ATTRIBUTES[11]).split(' ')[1],
    'user_agent': ATTRIBUTES[12],
    'total_time': parseFloat(ATTRIBUTES[4]) + parseFloat(ATTRIBUTES[5]) + parseFloat(ATTRIBUTES[6]),
    'ssl_cipher': ATTRIBUTES[13],
    'ssl_protocol': ATTRIBUTES[14],
    'target_group_arn': ATTRIBUTES[15],
    'trace_id': ATTRIBUTES[16]
  };
  return parsedLine;
}

function filterByDate(line, start, end) {
  const timestamp = new Date(line.timestamp).getTime();

  if (start && start.getTime() > timestamp) {
    return true;
  }

  if (end && end.getTime() < timestamp) {
    return true;
  }

  return false;
}