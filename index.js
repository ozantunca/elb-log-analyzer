#! /usr/bin/env node

var fs = require('fs')
  , _ = require('underscore')
  , argv = require('optimist').argv
  , async = require('async')
  , glob = require('glob')
  , colors = require('colors/safe')
  , usefulColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']
  , OUTPUT_LIMIT = 10
  , VERSION = 'v0.2.0'
  , files = argv._;


if (argv.version) {
  return console.log(VERSION);
}

if (files == 0) {
  throw new Error('No argument or file specified');
}

// Assign default columns
argv.cols = [ 'count', 'requested_resource' ];
argv.prefixes = [];
argv.sortBy = argv.sortBy || argv.s;

// Parse prefixes and column choices
_.each(argv, function (arg, key) {
  var match = key.match(/^p(refix){0,1}([0-9]+)$/);

  if (match) {
    argv.prefixes[match[2] - 1] = arg;
    return;
  }

  match = key.match(/^c(ol){0,1}([0-9]+)$/);

  if (match)
    argv.cols[match[2] - 1] = arg;
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
      if (results.directory && !!results.directory.length) return next(null, results.directory);
      glob(files[0], next);
    }]
  }, function (err, results) {
    if (err) throw err;
    if (!results.singleFile.length) throw new Error('No file found.');

    // assign files
    files = results.singleFile;

    // Loop through files
    async.map(files, function (file, next) {

      // Read file contents
      fs.readFile(file, 'utf-8', function (err, data) {
        if (err) return next(err);
        next(null, data.split('\n'));
      });
    }, processLogs);
  });
}
else {
  // Loop through files
  async.map(files, function (file, next) {

    // Read file contents
    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) return next(err);
      next(null, data.split('\n'));
    });
  }, processLogs);
}


// Processing logs
function processLogs(err, logs) {
  if (err) throw err;

  // Split and parse lines
  logs = _.chain(logs)
  .reduce(function (allData, fileData) {
    return allData.concat(fileData);
  })
  .compact()
  .map(function (line) { // Parse log lines for easy access
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

  var countIndex = argv.cols.indexOf('count');

  // Return count
  if (countIndex > -1) {
    var tempCols = argv.cols.slice(0);

    tempCols.splice(countIndex, 1);

    var logs = _.chain(logs)
    .countBy(function (l) {
      return JSON.stringify(_.map(tempCols, function (c) { return l[c]; }));
    })
    .pairs()
    .map(function (l) {
      var count = l[1];
      l = JSON.parse(l[0]);
      l.splice(countIndex, 0, count);
      return l;
    });

    if (argv.prefixes.length)
      logs = logs.filter(filterLogs)

    logs = logs
    .sortBy(argv.sortBy ? argv.sortBy - 1 : 0)
    .value();
  }
  // Return custom column2
  else {
    var tempCols = argv.cols.slice(0);
    var logs = _.chain(logs)
    .map(function (log) {
      return _.values(_.pick.apply(this, [log].concat(tempCols)));
    });

    if (argv.prefixes.length)
      logs = logs.filter(filterLogs)

    logs = logs
    .sortBy(argv.sortBy ? argv.sortBy - 1 : 0)
    .value();
  }

  // Overwrite output limit according to --limit argument
  OUTPUT_LIMIT = argv.limit || OUTPUT_LIMIT;
  OUTPUT_LIMIT = OUTPUT_LIMIT <= logs.length ? OUTPUT_LIMIT : logs.length;

  // Output results
  var i = 0, log;
  // Ascending
  if (argv.a) {
    while (i++ < OUTPUT_LIMIT) {
      log = logs.shift();
      console.log(colors.white(i) + ' - ' + _.map(log, function (l, index) { return colors[usefulColors[index % usefulColors.length]](l) }).join(colors.white(' - ')));
    }
  }
  // Descending
  else {
    while (i++ < OUTPUT_LIMIT) {
      log = logs.pop();
      console.log(colors.white(i) + ' - ' + _.map(log, function (l, index) { return colors[usefulColors[index % usefulColors.length]](l) }).join(colors.white(' - ')));
    }
  }
}

// Function to filter logs by prefixes
function filterLogs(log) {
  // Prefixes are strings that queried resources starts with.
  // For example, to find URL's starting with http://example.com
  // argument should be --prefix1=http:/example.com
  for (var i = 1; i < argv.prefixes.length; i++) {
    var p = argv.prefixes[i];
    if (!p) continue;

    if (String(log[i]).indexOf(p) != 0)
      return false;
  }

  return true;
}
