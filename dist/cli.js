#! /usr/bin/env node

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('babel-polyfill');

var _lib = require('./lib.js');

var _lib2 = _interopRequireDefault(_lib);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var USEFUL_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

var options = require('optimist').argv,
    files = options._,
    bar = void 0;

if (options.version || options.v) {
  console.log(JSON.parse(_fs2.default.readFileSync(__dirname + '/../package.json')).version);
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
}

// Assign default columns
options.cols = ['count', 'requested_resource'];
options.prefixes = [];
options.sortBy = options.sortBy - 1; // lib.js accepts sortBy starting with 0 while cli accepts starting with 1
options.limit = options.limit || 10;
options.ascending = options.a;

// Parse prefixes and column choices
_underscore2.default.each(options, function (arg, key) {
  var match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match) {
    return options.prefixes[match[2] - 1] = arg;
  }

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match) {
    options.cols[match[2] - 1] = arg;
  }
});

(0, _lib2.default)(_extends({
  files: files
}, options, {
  onProgress: function onProgress() {
    bar.tick();
  },
  onStart: function onStart(filenames) {
    bar = new _progress2.default(' processing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: filenames.length
    });
  }
})).then(function (logs) {
  _underscore2.default.each(logs, function (log, i) {
    console.log(_safe2.default.white(i + 1) + ' - ' + _underscore2.default.map(log, function (l, index) {
      return _safe2.default[USEFUL_COLORS[index % USEFUL_COLORS.length]](l);
    }).join(_safe2.default.white(' - ')));
  });
}).catch(handler);

function handler(err) {
  console.log(_safe2.default.red('An error occured') + ': ', _safe2.default.cyan(err));
}