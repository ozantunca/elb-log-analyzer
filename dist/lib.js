'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var FIELDS = ['timestamp', 'elb', 'client:port', 'client', 'backend:port', 'backend', 'request_processing_time', 'backend_processing_time', 'response_processing_time', 'elb_status_code', 'backend_status_code', 'received_bytes', 'sent_bytes', 'request', 'requested_resource', 'user_agent', 'total_time', 'count'];

exports.default = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref) {
    var _ref$logs = _ref.logs;
    var logs = _ref$logs === undefined ? [] : _ref$logs;
    var _ref$files = _ref.files;
    var files = _ref$files === undefined ? [] : _ref$files;
    var _ref$cols = _ref.cols;
    var cols = _ref$cols === undefined ? ['count', 'requested_resource'] : _ref$cols;
    var _ref$prefixes = _ref.prefixes;
    var prefixes = _ref$prefixes === undefined ? [] : _ref$prefixes;
    var _ref$sortBy = _ref.sortBy;
    var sortBy = _ref$sortBy === undefined ? 0 : _ref$sortBy;
    var _ref$limit = _ref.limit;
    var limit = _ref$limit === undefined ? 10 : _ref$limit;
    var _ref$ascending = _ref.ascending;
    var ascending = _ref$ascending === undefined ? false : _ref$ascending;
    var start = _ref.start;
    var end = _ref.end;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new _bluebird2.default(function (pass, fail) {
              // Fail when user requests a column that is not support by the analyzer
              if (cols.some(function (c) {
                return ! ~FIELDS.indexOf(c);
              })) {
                return fail('One or more of the requested columns does not exist.');
              }

              // Fail when user gives a sortBy value for a non-existent column
              if (sortBy < 0 || sortBy > cols.length - 1) {
                return fail('Invalid \'sortBy\' parameter. \'sortBy\' cannot be lower than 0 or greater than number of columns.');
              }

              var processor = generateProcessor({
                cols: cols,
                sortBy: sortBy,
                limit: limit,
                ascending: ascending,
                prefixes: prefixes,
                start: start,
                end: end
              });

              var filterFunc = generateFilter(prefixes.slice(), cols);

              parseFiles(files, processor.process.bind(processor, filterFunc)).then(function () {
                var logs = processor.getResults();

                if (ascending) logs = logs.slice(0, limit);else logs = logs.slice(logs.length > limit ? logs.length - limit : 0).reverse();

                pass(logs);
              }).catch(fail);
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return ref.apply(this, arguments);
  };
}();

// Reads files line by line and passes them
// to the processor function


function parseFiles(files, processFunc) {
  return new _bluebird2.default(function (pass, fail) {
    // Loop through files
    _async2.default.map(files, function (file, next) {
      var RL = _readline2.default.createInterface({
        input: _fs2.default.createReadStream(file)
      });

      // Read file contents
      RL.on('line', function (line) {
        processFunc(line);
      });

      RL.on('close', next);
    }, function (err) {
      if (err) return fail(err);
      pass();
    });
  });
}

// Generates a filter function depending on prefixes
function generateFilter(prefixes, cols) {
  var COUNT_INDEX = cols.indexOf('count');

  if (COUNT_INDEX > -1) {
    prefixes.splice(COUNT_INDEX, 1);
  }

  if (prefixes.length === 0) return null;

  return function (line) {
    return _underscore2.default.every(prefixes, function (p, i) {
      return !p && p !== 0 || // no prefix for this index
      line[i] && // line has value in that index
      line[i].toString().startsWith(p);
    } // line startsWith given prefix
    );
  };
}

function generateProcessor(_ref2) {
  var cols = _ref2.cols;
  var sortBy = _ref2.sortBy;
  var ascending = _ref2.ascending;
  var limit = _ref2.limit;
  var prefixes = _ref2.prefixes;
  var start = _ref2.start;
  var end = _ref2.end;

  var COUNT_INDEX = cols.indexOf('count');

  if (COUNT_INDEX > -1) {
    var _ret = function () {
      var counts = {};
      var tempCols = cols.slice(0);

      tempCols.splice(COUNT_INDEX, 1);

      return {
        v: {
          process: function process(filterFunc, line) {
            line = parseLine(line);

            // filter lines by date if requested
            if ((start || end) && filterByDate(line, start, end)) return;

            line = _underscore2.default.map(tempCols, function (c) {
              return line[c];
            });

            // Drop the line if any of the columns requested does not exist in this line
            if (line.some(function (c) {
              return !c && c !== 0;
            })) return;

            // Count column is not in 'line' at this moment
            // so we are defining a new variable that includes it
            if (filterFunc && !filterFunc(line)) return;

            // stringifying columns serves as a multi-column group_by
            var LINESTRING = JSON.stringify(line);
            counts[LINESTRING] = counts[LINESTRING] ? counts[LINESTRING] + 1 : 1;
          },
          getResults: function getResults() {
            var q = _underscore2.default.chain(counts).pairs().map(function (l) {
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

            return q.sortBy(sortBy).value();
          }
        }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    var _ret2 = function () {
      var TEMP_COLS = cols.slice(0);
      var outputLines = [];

      return {
        v: {
          process: function process(filterFunc, line) {
            line = parseLine(line);

            // filter lines by date if requested
            if ((start || end) && filterByDate(line, start, end)) return;

            line = _underscore2.default.map(TEMP_COLS, function (c) {
              return line[c];
            });

            // Drop the line if any of the columns requested does not exist in this line
            if (line.some(function (c) {
              return !c && c !== 0;
            })) return;

            if (filterFunc && !filterFunc(line)) return;

            var FIRSTLINE = _underscore2.default.first(outputLines);

            // Add lines until the limit is reached
            if (outputLines.length < limit) {
              outputLines = splice(outputLines, line, sortBy);
            }
            // Drop lines immediately that are below the last item
            // of currently sorted list. Otherwise add them and
            // drop the last item.
            else {
                var compare = void 0;

                if (typeof FIRSTLINE[sortBy] === 'number' && typeof line[sortBy] === 'number') {
                  compare = FIRSTLINE[sortBy] < line[sortBy] ? -1 : 1;
                } else {
                  compare = String(FIRSTLINE[sortBy]).localeCompare(line[sortBy]);
                }

                if (!ascending && compare === 1 || ascending && compare === -1) return;

                outputLines = splice(outputLines, line, sortBy);
                outputLines.shift();
              }
          },
          getResults: function getResults() {
            return outputLines;
          }
        }
      };
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
  }
}

// sort while inserting
function splice(lines, newLine, sortBy) {
  var l = lines.length,
      compare = void 0;

  while (l--) {
    if (typeof lines[l][sortBy] === 'number' && typeof newLine[sortBy] === 'number') {
      compare = lines[l][sortBy] < newLine[sortBy] ? -1 : 1;
    } else {
      compare = String(lines[l][sortBy]).localeCompare(newLine[sortBy]);
    }

    if (compare < 0) break;
  }

  lines.splice(l + 1, 0, newLine);
  return lines;
}

// line parser function
// @todo: will be customisable to be used for logs
// other than ELB's
function parseLine(line) {
  var ATTRIBUTES = line.split(' ');
  var user_agent = '';

  for (var i = 14; i < ATTRIBUTES.length - 2; i++) {
    user_agent = user_agent + ATTRIBUTES[i] + " ";
  }

  return {
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
    'request': ATTRIBUTES[11] + ' ' + ATTRIBUTES[12] + ' ' + ATTRIBUTES[13],
    'requested_resource': ATTRIBUTES[12],
    user_agent: user_agent,
    'total_time': parseFloat(ATTRIBUTES[4]) + parseFloat(ATTRIBUTES[5]) + parseFloat(ATTRIBUTES[6])
  };
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