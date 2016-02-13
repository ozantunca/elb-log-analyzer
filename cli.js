#! /usr/bin/env node


'use strict';

var _lib = require('./lib.js');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var async = require('async'),
    _ = require('underscore'),
    glob = require('glob'),
    VERSION = 'v0.3.0';

var options = require('optimist').argv,
    files = options._;

if (options.version || options.v) {
  console.log(VERSION);
  process.exit();
}

if (files == 0) throw new Error('No argument or file specified');

// Assign default columns
options.cols = ['count', 'requested_resource'];
options.prefixes = [];
options.sortBy = options.sortBy || options.s;
options.limit = options.limit || 10;

// Parse prefixes and column choices
_.each(options, function (arg, key) {
  var match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match) return options.prefixes[match[2] - 1] = arg;

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match) options.cols[match[2] - 1] = arg;
});

// If files array consists of only one value it could
// be either a single file or a directory of files
// to be processed.
if (files.length == 1) {
  async.auto({
    // Check if the file is a directory
    directory: function directory(next) {
      glob(files[0] + '/*', next);
    },

    // If it's not directory, pass single file
    singleFile: ['directory', function (next, results) {
      if (results.directory && !!results.directory.length) return next(null, results.directory);

      glob(files[0], next);
    }]
  }, function (err, results) {
    if (err) throw err;
    if (!results.singleFile.length) throw new Error('No file found.');

    files = results.singleFile;
    exec();
  });
} else exec();

function exec() {
  (0, _lib2.default)({
    files: files,
    options: options
  }).exec();
}