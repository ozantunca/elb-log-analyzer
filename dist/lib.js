'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

require("babel-polyfill");

var _fs = _interopRequireDefault(require("fs"));

var _readline = _interopRequireDefault(require("readline"));

var _underscore = _interopRequireDefault(require("underscore"));

var _bluebird = _interopRequireDefault(require("bluebird"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var glob = _bluebird.default.promisify(require('glob'));

var ALL_FIELDS = ['type', 'timestamp', 'elb', 'client:port', 'client', 'backend:port', 'backend', 'request_processing_time', 'backend_processing_time', 'response_processing_time', 'elb_status_code', 'backend_status_code', 'received_bytes', 'sent_bytes', 'request', 'requested_resource', 'user_agent', 'total_time', 'count', 'target_group_arn', 'trace_id', 'ssl_cipher', 'ssl_protocol'];

function _default(_ref) {
  var _ref$files = _ref.files,
      files = _ref$files === void 0 ? [] : _ref$files,
      _ref$requestedColumns = _ref.requestedColumns,
      requestedColumns = _ref$requestedColumns === void 0 ? ['count', 'requested_resource'] : _ref$requestedColumns,
      _ref$prefixes = _ref.prefixes,
      prefixes = _ref$prefixes === void 0 ? [] : _ref$prefixes,
      _ref$sortBy = _ref.sortBy,
      sortBy = _ref$sortBy === void 0 ? 0 : _ref$sortBy,
      _ref$limit = _ref.limit,
      limit = _ref$limit === void 0 ? 10 : _ref$limit,
      _ref$ascending = _ref.ascending,
      ascending = _ref$ascending === void 0 ? false : _ref$ascending,
      start = _ref.start,
      end = _ref.end,
      _ref$onProgress = _ref.onProgress,
      onProgress = _ref$onProgress === void 0 ? function () {} : _ref$onProgress,
      _ref$onStart = _ref.onStart,
      onStart = _ref$onStart === void 0 ? function () {} : _ref$onStart;
  // collect file names
  return _bluebird.default.map(files,
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(fileName) {
      var fileList;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return glob(fileName + '/**/*', {
                nodir: true
              });

            case 2:
              fileList = _context.sent;

              if (!(!fileList || !fileList.length)) {
                _context.next = 9;
                break;
              }

              _context.next = 6;
              return glob(fileName, {
                nodir: true
              });

            case 6:
              fileList = _context.sent;

              if (!(!fileList || !fileList.length)) {
                _context.next = 9;
                break;
              }

              throw new Error("No file with name '".concat(fileName, "' found."));

            case 9:
              return _context.abrupt("return", fileList);

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }()).then(function (results) {
    var fileNames = _underscore.default.flatten(results); // Processing starts


    onStart(fileNames); // Fail when user requests a column that is not support by the analyzer

    if (requestedColumns.some(function (c) {
      return !~ALL_FIELDS.indexOf(c);
    })) {
      throw new Error('One or more of the requested columns does not exist.');
    } // Fail when user gives a sortBy value for a non-existent column


    if (sortBy < 0 || sortBy > requestedColumns.length - 1) {
      throw new Error('Invalid \'sortBy\' parameter. \'sortBy\' cannot be lower than 0 or greater than number of columns.');
    }

    var processor = generateProcessor({
      requestedColumns: requestedColumns,
      sortBy: sortBy,
      limit: limit,
      ascending: ascending,
      prefixes: prefixes,
      start: start,
      end: end
    });
    var filterFunc = generateFilter(prefixes.slice(), requestedColumns);
    return parseFiles(fileNames, processor.process.bind(processor, filterFunc), onProgress).then(function () {
      var logs = processor.getResults();

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
  return _bluebird.default.map(fileNames, function (fileName) {
    return new _bluebird.default(function (resolve) {
      var RL = _readline.default.createInterface({
        terminal: false,
        input: _fs.default.createReadStream(fileName)
      }); // Read file contents


      RL.on('line', function (line) {
        processFunc(line);
      });
      RL.on('close', function () {
        onProgress();
        resolve();
      });
    });
  });
} // Generates a filter function depending on prefixes


function generateFilter(prefixes, requestedcolumns) {
  var COUNT_INDEX = requestedcolumns.indexOf('count');

  if (COUNT_INDEX > -1) {
    prefixes.splice(COUNT_INDEX, 1);
  }

  if (prefixes.length === 0) {
    return null;
  }

  return function (line) {
    return _underscore.default.every(prefixes, function (p, i) {
      return !p && p !== '0' || // no prefix for this index
      line[i] && // line has value in that index
      line[i].toString().startsWith(p);
    } // line startsWith given prefix
    );
  };
}

function generateProcessor(_ref3) {
  var requestedColumns = _ref3.requestedColumns,
      sortBy = _ref3.sortBy,
      ascending = _ref3.ascending,
      limit = _ref3.limit,
      prefixes = _ref3.prefixes,
      start = _ref3.start,
      end = _ref3.end;
  var COUNT_INDEX = requestedColumns.indexOf('count');

  if (COUNT_INDEX > -1) {
    var counts = {};
    var tempCols = requestedColumns.slice(0);
    tempCols.splice(COUNT_INDEX, 1);
    return {
      process: function process(filterFunc, line) {
        var lineObj = parseLine(line);

        if (!lineObj) {
          return;
        } // filter lines by date if requested


        if ((start || end) && filterByDate(lineObj, start, end)) {
          return;
        }

        lineObj = _underscore.default.map(tempCols, function (c) {
          return lineObj[c];
        }); // Drop the line if any of the columns requested does not exist in this line

        if (lineObj.some(function (c) {
          return !c && c !== '0';
        })) {
          return;
        } // Count column is not in 'line' at this moment
        // so we are defining a new variable that includes it


        if (filterFunc && !filterFunc(lineObj)) {
          return;
        } // stringifying columns serves as a multi-column group_by


        var LINESTRING = JSON.stringify(lineObj);
        counts[LINESTRING] = counts[LINESTRING] ? counts[LINESTRING] + 1 : 1;
      },
      getResults: function getResults() {
        var q = _underscore.default.chain(counts).pairs().map(function (l) {
          var COUNT = l[1];
          l = JSON.parse(l[0]);
          l.splice(COUNT_INDEX, 0, COUNT);
          return l;
        });

        if (prefixes && prefixes[COUNT_INDEX]) {
          q = q.filter(function (line) {
            return line[COUNT_INDEX].toString().startsWith(prefixes[COUNT_INDEX]);
          });
        }

        return q.sortBy(sortBy.toString()).value();
      }
    };
  } else {
    var TEMP_COLS = requestedColumns.slice(0);
    var outputLines = [];
    return {
      process: function process(filterFunc, line) {
        var lineObj = parseLine(line); // filter lines by date if requested

        if ((start || end) && filterByDate(lineObj, start, end)) {
          return;
        }

        lineObj = _underscore.default.map(TEMP_COLS, function (c) {
          return lineObj[c];
        }); // Drop the line if any of the columns requested does not exist in this line

        if (lineObj.some(function (c) {
          return !c && c !== '0';
        })) {
          return;
        }

        if (filterFunc && !filterFunc(lineObj)) {
          return;
        }

        var FIRSTLINE = _underscore.default.first(outputLines); // Add lines until the limit is reached


        if (outputLines.length < limit) {
          outputLines = splice(outputLines, lineObj, sortBy);
        } else {
          // Drop lines immediately that are below the last item
          // of currently sorted list. Otherwise add them and
          // drop the last item.
          var compare;

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
      getResults: function getResults() {
        return outputLines;
      }
    };
  }
} // sort while inserting


function splice(lines, newLine, sortBy) {
  var l = lines.length;
  var compare;

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
  if (!line || line === '') {
    return false;
  }

  var ATTRIBUTES = line.match(/[^\s"']+|"([^"]*)"/gi);
  var parsedLine = {};

  if (!ATTRIBUTES) {
    return false;
  }

  if (isNaN(new Date(ATTRIBUTES[0]).getTime())) {
    parsedLine.type = ATTRIBUTES.shift();
  }

  parsedLine = _objectSpread({}, parsedLine, {
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
  });
  return parsedLine;
}

function filterByDate(line, start, end) {
  var timestamp = new Date(line.timestamp).getTime();

  if (start && start.getTime() > timestamp) {
    return true;
  }

  if (end && end.getTime() < timestamp) {
    return true;
  }

  return false;
}