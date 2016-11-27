'use strict';

import 'babel-polyfill';
import fs       from 'fs';
import readline from 'readline';
import _        from 'underscore';
import glob     from 'glob';
import async    from 'async';
import Promise  from 'bluebird';

const FIELDS = ['timestamp', 'elb', 'client:port', 'client', 'backend:port', 'backend', 'request_processing_time',
                'backend_processing_time', 'response_processing_time', 'elb_status_code', 'backend_status_code',
                'received_bytes', 'sent_bytes', 'request', 'requested_resource', 'user_agent', 'total_time', 'count',
                'target_group_arn', 'trace_id', 'ssl_cipher', 'ssl_protocol'];

module.exports = function ({
  logs = [], files = [], cols = ['count', 'requested_resource'], prefixes = [],
  sortBy = 0, limit = 10, ascending = false, start, end, onProgress = () => {}, onStart = () => {}
}) {
  return new Promise((pass, fail) => {
    // collect file names
    async.map(files, (file, done) => {
      async.auto({
        // Check if the file is a directory
        directory (next) {
          glob(files[0] + '/**/*', { nodir: true }, next);
        },

        // If it's not directory, pass single file
        singleFile: ['directory', function (results, next) {
          if (results.directory && !!results.directory.length) {
            return next(null, results.directory);
          }

          glob(files[0], next);
        }]
      }, function (err, results) {
        if (err) return done(err);
        if (!results.singleFile.length) return done(`No file with name '${file}' found.`);

        done(null, results.singleFile);
      });
    }, (err, filenames) => {
      if (err) return fail(err);

      filenames = _.flatten(filenames);

      // Processing starts
      onStart(filenames);

      // Fail when user requests a column that is not support by the analyzer
      if (cols.some(c => !~FIELDS.indexOf(c))) {
        return fail('One or more of the requested columns does not exist.');
      }

      // Fail when user gives a sortBy value for a non-existent column
      if (sortBy < 0 || sortBy > cols.length - 1) {
        return fail('Invalid \'sortBy\' parameter. \'sortBy\' cannot be lower than 0 or greater than number of columns.');
      }

      const processor = generateProcessor({
        cols,
        sortBy,
        limit,
        ascending,
        prefixes,
        start,
        end,
      });

      const filterFunc = generateFilter(prefixes.slice(), cols);

      parseFiles(filenames, processor.process.bind(processor, filterFunc), onProgress)
      .then(function () {
        let logs = processor.getResults();

        if (ascending) {
          logs = logs.slice(0, limit);
        } else {
          logs = logs.slice(logs.length > limit ? logs.length - limit : 0).reverse();
        }

        pass(logs);
      })
      .catch(fail);
    });
  })
}

// Reads files line by line and passes them
// to the processor function
function parseFiles(files, processFunc, onProgress) {
  return new Promise((pass, fail) => {
    // Loop through files
    async.map(files, function (file, next) {
      const RL = readline.createInterface({
        terminal: false,
        input: fs.createReadStream(file)
      });

      // Read file contents
      RL.on('line', line => {
        processFunc(line);
      });

      RL.on('close', () => {
        onProgress();
        next();
      });

    }, err => {
      if (err) return fail(err);
      pass();
    });
  });
}

// Generates a filter function depending on prefixes
function generateFilter (prefixes, cols) {
  const COUNT_INDEX = cols.indexOf('count');

  if (COUNT_INDEX > -1) {
    prefixes.splice(COUNT_INDEX, 1);
  }

  if (prefixes.length === 0) return null;

  return line =>
    _.every(prefixes, (p, i) =>
      !p && p !== 0 || // no prefix for this index
      line[i] && // line has value in that index
      line[i].toString().startsWith(p) // line startsWith given prefix
    );
}

function generateProcessor ({ cols, sortBy, ascending, limit, prefixes, start, end }) {
  const COUNT_INDEX = cols.indexOf('count');

  if (COUNT_INDEX > -1) {
    let counts = {};
    let tempCols = cols.slice(0);

    tempCols.splice(COUNT_INDEX, 1);

    return {
      process (filterFunc, line) {
        line = parseLine(line);

        // filter lines by date if requested
        if ((start || end) && filterByDate(line, start, end))
          return;

        line = _.map(tempCols, c => line[c]);

        // Drop the line if any of the columns requested does not exist in this line
        if (line.some(c => !c && c !== 0))
          return;

        // Count column is not in 'line' at this moment
        // so we are defining a new variable that includes it
        if (filterFunc && !filterFunc(line))
          return;

        // stringifying columns serves as a multi-column group_by
        const LINESTRING = JSON.stringify(line);
        counts[LINESTRING] = counts[LINESTRING] ? counts[LINESTRING] + 1 : 1;
      },

      getResults () {
        let q = _.chain(counts)
          .pairs()
          .map(function (l) {
            const COUNT = l[1];
            l = JSON.parse(l[0]);
            l.splice(COUNT_INDEX, 0, COUNT);
            return l;
          });

        if (prefixes && prefixes[COUNT_INDEX]) {
          q = q.filter(line => line[COUNT_INDEX].toString().startsWith(prefixes[COUNT_INDEX]));
        }

        return q.sortBy(sortBy).value();
      }
    };
  }
  else {
    const TEMP_COLS = cols.slice(0);
    let outputLines = [];

    return {
      process (filterFunc, line) {
        line = parseLine(line);

        // filter lines by date if requested
        if ((start || end) && filterByDate(line, start, end))
          return;

        line = _.map(TEMP_COLS, c => line[c]);

        // Drop the line if any of the columns requested does not exist in this line
        if (line.some(c => !c && c !== 0))
          return;

        if (filterFunc && !filterFunc(line))
          return;

        const FIRSTLINE = _.first(outputLines);

        // Add lines until the limit is reached
        if (outputLines.length < limit) {
          outputLines = splice( outputLines, line, sortBy );
        }
        // Drop lines immediately that are below the last item
        // of currently sorted list. Otherwise add them and
        // drop the last item.
        else {
          let compare;

          if (typeof FIRSTLINE[sortBy] === 'number' && typeof line[sortBy] === 'number') {
            compare = FIRSTLINE[sortBy] < line[sortBy] ? -1 : 1;
          } else {
            compare = String(FIRSTLINE[sortBy]).localeCompare(line[sortBy]);
          }

          if (!ascending && compare === 1 || ascending && compare === -1)
            return;

          outputLines = splice( outputLines, line, sortBy );
          outputLines.shift();
        }
      },

      getResults () {
        return outputLines;
      }
    }
  }
}

// sort while inserting
function splice (lines, newLine, sortBy) {
  let l = lines.length
    , compare;

  while (l--) {
    if (typeof lines[l][sortBy] === 'number' && typeof newLine[sortBy] === 'number') {
      compare = lines[l][sortBy] < newLine[sortBy] ? -1 : 1;
    } else {
      compare = String(lines[l][sortBy]).localeCompare(newLine[sortBy]);
    }

    if (compare < 0)
      break;
  }

  lines.splice(l + 1, 0, newLine);
  return lines;
}

// line parser function
// @todo: will be customisable to be used for logs
// other than ELB's
function parseLine (line) {
  const ATTRIBUTES = line.match(/[^\s"']+|"([^"]*)"/gi);
  let user_agent = '';

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
    'request': ATTRIBUTES[11],
    'requested_resource': String(ATTRIBUTES[11]).split(' ')[1],
    'user_agent': ATTRIBUTES[12],
    'total_time': parseFloat(ATTRIBUTES[4]) + parseFloat(ATTRIBUTES[5]) + parseFloat(ATTRIBUTES[6]),
    'ssl_cipher': ATTRIBUTES[13],
    'ssl_protocol': ATTRIBUTES[14],
    'target_group_arn': ATTRIBUTES[15],
    'trace_id': ATTRIBUTES[16]
  };
}

function filterByDate (line, start, end) {
  const timestamp = (new Date(line.timestamp)).getTime();

  if (start && start.getTime() > timestamp) {
    return true;
  }

  if (end && end.getTime() < timestamp) {
    return true;
  }

  return false;
}
