#! /usr/bin/env node
'use strict';

import 'babel-polyfill';
import lib   from './lib.js';
import async from 'async';
import _     from 'underscore';
import glob  from 'glob';
import colors from 'colors/safe'

const VERSION = 'v0.3.0'
  , USEFUL_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']

let options = require('optimist').argv
  , files = options._;

if (options.version || options.v) {
  console.log(VERSION);
  process.exit();
}

if (files == 0)
  throw new Error('No argument or file specified');

options.sortBy = options.sortBy || options.s || 1;

if (typeof options.sortBy !== 'number')
  throw new Error('--sortBy must be a number');

// Assign default columns
options.cols = [ 'count', 'requested_resource' ];
options.prefixes = [];
options.sortBy = options.sortBy - 1; // lib.js accepts sortBy starting with 0 while cli accepts starting with 1
options.limit = options.limit || 10;
options.ascending = options.a;

// Parse prefixes and column choices
_.each(options, function (arg, key) {
  let match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match)
    return options.prefixes[match[2] - 1] = arg;

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match)
    options.cols[match[2] - 1] = arg;
});

// If files array consists of only one value it could
// be either a single file or a directory of files
// to be processed.
if (files.length == 1) {
  async.auto({
    // Check if the file is a directory
    directory: function (next) {
      glob(files[0] + '/*', next);
    },

    // If it's not directory, pass single file
    singleFile: ['directory', function (next, results) {
      if (results.directory && !!results.directory.length)
        return next(null, results.directory);

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
  lib({ files: files, ...options })
  .then(function (logs) {
    _.each(logs, (log, i) => {
      console.log(colors.white(i + 1) + ' - ' + _.map(log, (l, index) => colors[USEFUL_COLORS[index % USEFUL_COLORS.length]](l) ).join(colors.white(' - ')));
    });
  })
  .catch(err => { throw err; });
}
