#! /usr/bin/env node

var fs = require('fs');
var _ = require('underscore');
var argv = require('optimist').argv;
var async = require('async');
var glob = require('glob');
var colors = require('colors');
var OUTPUT_LIMIT = 10;

var files = argv._;

if(files == 0) {
  throw new Error('No argument or file specified');
}

if(files.length == 1) {
  async.auto({
    // check directory
    directory: function (next) {
      glob(files[0] + '/*', next);
    },

    // if not directory, get single file
    singleFile: ['directory', function (next, results) {
      if(results.directory && !!results.directory.length) return next(null, results.directory);
      glob(files[0], next);
    }]
  }, function (err, results) {
    if(err) throw err;
    if(!results.singleFile.length) throw new Error('No file found.');
    files = results.singleFile;

    // loop through files
    async.map(files, function (file, next) {
      // read file contents
      fs.readFile(file, 'utf-8', function (err, data) {
        if(err) return next(err);
        next(null, data.split('\n'));
      });
    }, processLogs);
  });
}
else {
  async.map(files, function (file, next) {
    // read file contents
    fs.readFile(file, 'utf-8', function (err, data) {
      if(err) return next(err);
      next(null, data.split('\n'));
    });
  }, processLogs);
}


function processLogs(err, logs) {
  if(err) throw err;

  var col1 = argv.col1 || 'count'
    , col2 = argv.col2 || 'requested_resource';

  // Split and parse lines
  logs = _.chain(logs)
  .reduce(function (allData, fileData) {
    return allData.concat(fileData);
  })
  .compact().map(function (line) {
    var attributes = line.split(' ');
    return log = {
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
      'request': attributes[11] +' '+ attributes[12] +' '+ attributes[13],
      'requested_resource': attributes[12],
      'total_time': parseFloat(attributes[4]) + parseFloat(attributes[5]) + parseFloat(attributes[6])
    };
  }).value();

  OUTPUT_LIMIT = argv.limit || OUTPUT_LIMIT;
  OUTPUT_LIMIT = OUTPUT_LIMIT <= logs.length ? OUTPUT_LIMIT : logs.length;

  // return count
  if(col1 == 'count') {
    var logs = _.chain(logs)
    .countBy(col2)
    .pairs()
    .sortBy(1)
    .value();
  }
  // return custom column2
  else {
    var logs = _.chain(logs)
    .sortBy(col1)
    .map(function (log) {
      return [ log[col2], log[col1] ];
    })
    .value();
  }

  if(argv.prefix1 || argv.prefix2) {
    logs = logs.filter(function (log) {
      return (argv.prefix1 ? log[1].toString().indexOf(argv.prefix1) == 0 : true) && (argv.prefix2 ? log[0].toString().indexOf(argv.prefix2) == 0 : true);
    });
  }

  var i = 0, log;
  if(argv.a) {
    while(i++ < OUTPUT_LIMIT) {
      log = logs.shift();
      console.log(colors.white(i) + ' - ' + colors.cyan(log[1]) + ': ' + colors.red(log[0]));
    }
  }
  else {
    while(i++ < OUTPUT_LIMIT) {
      log = logs.pop();
      console.log(colors.white(i) + ' - ' + colors.cyan(log[1]) + ': ' + colors.red(log[0]));
    }
  }
}
