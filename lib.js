#! /usr/bin/env node


'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var readFiles = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(files) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt('return', new _promise2.default(function (pass, fail) {
              // Loop through files
              var lines = [];

              async.map(files, function (file, next) {
                var rl = readline.createInterface({
                  input: fs.createReadStream(file)
                });

                // Read file contents
                rl.on('line', function (line) {
                  lines.push(processLine(line));
                });

                rl.on('close', next);
              }, function (err) {
                if (err) return fail(err);
                pass(lines);
              });
            }));

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return function readFiles(_x3) {
    return ref.apply(this, arguments);
  };
}();

exports.default = function (_ref) {
  var _ref$logs = _ref.logs;
  var logs = _ref$logs === undefined ? [] : _ref$logs;
  var _ref$files = _ref.files;
  var files = _ref$files === undefined ? [] : _ref$files;
  var _ref$options = _ref.options;
  var options = _ref$options === undefined ? {} : _ref$options;

  var self = {
    filter: function filter() {
      if (!options.prefixes.length) return self;

      _.filter(logs, function (log) {
        // Prefixes are strings that queried resources starts with.
        // For example, to find URL's starting with http://example.com
        // argument should be --prefix1=http:/example.com
        for (var i = 1; i < options.prefixes.length; i++) {
          var p = options.prefixes[i];
          if (!p) continue;

          if (String(log[i]).indexOf(p) != 0) return false;
        }

        return true;
      });

      return self;
    },

    process: function process() {
      var _this = this;

      var countIndex = options.cols.indexOf('count');

      if (countIndex > -1) {
        (function () {
          var tempCols = options.cols.slice(0);

          tempCols.splice(countIndex, 1);

          // Count all columns by grouping them
          // Join columns to form an array, then JSON.stringify
          // the array to form a unique string
          logs = _.chain(logs).countBy(function (l) {
            return (0, _stringify2.default)(_.map(tempCols, function (c) {
              return l[c];
            }));
          }).pairs()
          // Place "count" column where it was intended
          .map(function (l) {
            var count = l[1];
            l = JSON.parse(l[0]);
            l.splice(countIndex, 0, count);
            return l;
          });
        })();
      } else {
        (function () {
          var tempCols = options.cols.slice(0);
          logs = _.chain(logs).map(function (log) {
            return _.values(_.pick.apply(_this, [log].concat(tempCols)));
          });
        })();
      }

      return self;
    },

    sort: function sort() {
      logs = logs.sortBy(options.sortBy ? options.sortBy - 1 : 0).value();
      return self;
    },

    print: function print() {
      // Overwrite output limit according to --limit argument
      options.limit = options.limit <= logs.length ? options.limit : logs.length;

      // Output results
      var i = 0,
          log = undefined;
      // Ascending
      if (options.a) {
        while (i++ < options.limit) {
          log = logs.shift();
          // join columns by assigning colors
          console.log(colors.white(i) + ' - ' + _.map(log, function (l, index) {
            return colors[usefulColors[index % usefulColors.length]](l);
          }).join(colors.white(' - ')));
        }
      }
      // Descending
      else {
          while (i++ < options.limit) {
            log = logs.pop();
            // join columns by assigning colors
            console.log(colors.white(i) + ' - ' + _.map(log, function (l, index) {
              return colors[usefulColors[index % usefulColors.length]](l);
            }).join(colors.white(' - ')));
          }
        }
    },

    exec: function () {
      var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', new _promise2.default(function () {
                  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(pass, fail) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!files.length) {
                              _context.next = 6;
                              break;
                            }

                            _context.t0 = logs;
                            _context.next = 4;
                            return readFiles(files);

                          case 4:
                            _context.t1 = _context.sent;
                            logs = _context.t0.concat.call(_context.t0, _context.t1);

                          case 6:

                            self.process().filter().sort().print();
                            pass();

                          case 8:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this2);
                  })),
                      _this = _this2;
                  return function (_x, _x2) {
                    return ref.apply(_this, arguments);
                  };
                }()));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      return function exec() {
        return ref.apply(this, arguments);
      };
    }()
  };

  return self;
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs'),
    readline = require('readline'),
    _ = require('underscore'),
    async = require('async'),
    colors = require('colors/safe'),
    usefulColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

function processLine(line) {
  var attributes = line.split(' ');
  var user_agent = '';

  for (var i = 14; i < attributes.length - 2; i++) {
    user_agent = user_agent + attributes[i] + " ";
  }

  return {
    'timestamp': attributes[0],
    'elb': attributes[1],
    'client:port': attributes[2],
    'backend:port': attributes[3],
    'request_processing_time': attributes[4],
    'backend_processing_time': attributes[5],
    'response_processing_time': attributes[6],
    'elb_status_code': attributes[7],
    'backend_status_code': attributes[8],
    'received_bytes': attributes[9],
    'sent_bytes': attributes[10],
    'request': attributes[11] + ' ' + attributes[12] + ' ' + attributes[13],
    'requested_resource': attributes[12],
    'user_agent': user_agent,
    'total_time': parseFloat(attributes[4]) + parseFloat(attributes[5]) + parseFloat(attributes[6])
  };
}