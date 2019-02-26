#! /usr/bin/env node
"use strict";

var _lib = _interopRequireDefault(require("./lib"));

var _underscore = _interopRequireDefault(require("underscore"));

var _progress = _interopRequireDefault(require("progress"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _minimist = _interopRequireDefault(require("minimist"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var colors = require('colors/safe');

var USEFUL_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
var options = (0, _minimist.default)(process.argv.slice(2));
var files = options._;
var bar;

if (options.version || options.v) {
  var filePath = _path.default.join(__dirname, '/../package.json');

  console.log(JSON.parse(_fs.default.readFileSync(filePath).toString()).version);
  process.exit();
}

if (!files.length) {
  handler(new Error('No argument or file specified'));
  process.exit();
}

if (options.start) {
  options.start = String(options.start);

  if (new Date(options.start).toString() === 'Invalid Date') {
    handler(new Error('Start date is invalid'));
    process.exit();
  } else {
    options.start = new Date(options.start);
  }
}

if (options.end) {
  options.end = String(options.end);

  if (new Date(options.end).toString() === 'Invalid Date') {
    handler(new Error('End date is invalid'));
    process.exit();
  } else {
    options.end = new Date(options.end);
  }
}

options.sortBy = options.sortBy || options.s || 1;

if (typeof options.sortBy !== 'number') {
  handler(new Error('--sortBy must be a number'));
  process.exit();
} // Assign default columns


options.cols = ['count', 'requested_resource'];
options.prefixes = [];
options.sortBy = options.sortBy - 1; // lib.js accepts sortBy starting with 0 while cli accepts starting with 1

options.limit = options.limit || 10;
options.ascending = options.a; // Parse prefixes and column choices

_underscore.default.each(options, function (arg, key) {
  let match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match && !isNaN(Number(match[2]))) {
    var index = Number(match[2]) - 1;
    options.prefixes[index] = arg;
    return arg;
  }

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match && !isNaN(Number(match[2]))) {
    let index = Number(match[2]) - 1;
    options.cols[index] = arg;
  }
});

(0, _lib.default)(_objectSpread({
  files: files,
  requestedColumns: options.cols
}, _underscore.default.pick(options, 'prefixes', 'sortBy', 'limit', 'ascending', 'start', 'end'), {
  onProgress: function onProgress() {
    bar.tick();
  },

  onStart(filenames) {
    bar = new _progress.default(' processing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: filenames.length
    });
  }

}).then(function (logs) {
  _underscore.default.each(logs, (log, i) => {
    const coloredText = _underscore.default.map(log, (l, index) => {
      const colorName = USEFUL_COLORS[index % USEFUL_COLORS.length];
      return colors[colorName](l);
    }).join(colors.white(' - '));

    console.log(colors.white(String(i + 1)) + ' - ' + coloredText);
  });
}).catch(handler);

function handler(err) {
  console.log(`${colors.red('An error occured')}: `, colors.cyan(err.toString()));
}