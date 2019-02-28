#! /usr/bin/env node
"use strict";

var _lib = _interopRequireDefault(require("./lib"));

var _lodash = _interopRequireDefault(require("lodash"));

var _progress = _interopRequireDefault(require("progress"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const USEFUL_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

const colors = require('colors/safe');

let options = require('optimist').argv;

let files = options._;
let bar;

if (options.version || options.v) {
  const content = _fs.default.readFileSync(_path.default.join(__dirname, '/../package.json')).toString();

  console.log(JSON.parse(content).version);
  process.exit();
}

if (!files.length) {
  handler(new Error('No argument or file specified'));
  process.exit();
}

options.sortBy = options.sortBy || options.s || 1;

if (typeof options.sortBy !== 'number') {
  handler(new Error('--sortBy must be a number'));
  process.exit();
} // Assign default columns


const parsedOptions = {
  files,
  cols: ['count', 'requested_resource'],
  prefixes: [],
  sortBy: options.sortBy - 1,
  // lib.js accepts sortBy starting with 0 while cli accepts starting with 1
  limit: options.limit || 10,
  ascending: options.a
};

if (!_lodash.default.isEmpty(options.start)) {
  options.start = String(options.start);

  if (new Date(options.start).toString() === 'Invalid Date') {
    handler(new Error('Start date is invalid'));
    process.exit();
  } else {
    parsedOptions.start = new Date(options.start);
  }
}

if (!_lodash.default.isEmpty(options.end)) {
  options.end = String(options.end);

  if (new Date(options.end).toString() === 'Invalid Date') {
    handler(new Error('End date is invalid'));
    process.exit();
  } else {
    parsedOptions.end = new Date(options.end);
  }
} // Parse prefixes and column choices


_lodash.default.each(options, function (arg, key) {
  let match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match && !isNaN(Number(match[2]))) {
    let index = Number(match[2]) - 1;
    parsedOptions.prefixes[index] = arg;
    return;
  }

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match && !isNaN(Number(match[2]))) {
    let index = Number(match[2]) - 1;
    parsedOptions.cols[index] = arg;
  }
});

(0, _lib.default)({ ...parsedOptions,

  onProgress() {
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
  _lodash.default.each(logs, (log, i) => {
    const coloredText = _lodash.default.map(log, (l, index) => {
      const colorName = USEFUL_COLORS[index % USEFUL_COLORS.length];
      return colors[colorName](l);
    }).join(colors.white(' - '));

    console.log(colors.white(String(i + 1)) + ' - ' + coloredText);
  });
}).catch(handler);

function handler(err) {
  console.log(`${colors.red('An error occured')}: `, colors.cyan(err.toString()));
}