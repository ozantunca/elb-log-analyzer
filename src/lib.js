#! /usr/bin/env node

'use strict';

const fs = require('fs')
  , readline = require('readline')
  , _ = require('underscore')
  , async = require('async')
  , colors = require('colors/safe')
  , usefulColors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']


export default function ({ logs = [], files = [], options = {} }) {
  const self = {
    filter: function () {
      if (!options.prefixes.length) return self;

      _.filter(logs, log => {
        // Prefixes are strings that queried resources starts with.
        // For example, to find URL's starting with http://example.com
        // argument should be --prefix1=http:/example.com
        for (let i = 1; i < options.prefixes.length; i++) {
          const p = options.prefixes[i];
          if (!p) continue;

          if (String(log[i]).indexOf(p) != 0)
            return false;
        }

        return true;
      });

      return self;
    },

    process: function () {
      const countIndex = options.cols.indexOf('count');

      if (countIndex > -1) {
        let tempCols = options.cols.slice(0);

        tempCols.splice(countIndex, 1);

        // Count all columns by grouping them
        // Join columns to form an array, then JSON.stringify
        // the array to form a unique string
        logs = _.chain(logs)
        .countBy(l => JSON.stringify(_.map(tempCols, c => l[c])))
        .pairs()
        // Place "count" column where it was intended
        .map(function (l) {
          let count = l[1];
          l = JSON.parse(l[0]);
          l.splice(countIndex, 0, count);
          return l;
        });
      }
      else {
        const tempCols = options.cols.slice(0);
        logs = _.chain(logs).map(log => _.values(_.pick.apply(this, [log].concat(tempCols))))
      }

      return self;
    },

    sort: function () {
      logs = logs
      .sortBy(options.sortBy ? options.sortBy - 1 : 0)
      .value();
      return self;
    },

    print: function () {
      // Overwrite output limit according to --limit argument
      options.limit = options.limit <= logs.length ? options.limit : logs.length;

      // Output results
      let i = 0, log;
      // Ascending
      if (options.a) {
        while (i++ < options.limit) {
          log = logs.shift();
          // join columns by assigning colors
          console.log(colors.white(i) + ' - ' + _.map(log, (l, index) => colors[usefulColors[index % usefulColors.length]](l) ).join(colors.white(' - ')));
        }
      }
      // Descending
      else {
        while (i++ < options.limit) {
          log = logs.pop();
          // join columns by assigning colors
          console.log(colors.white(i) + ' - ' + _.map(log, (l, index) => colors[usefulColors[index % usefulColors.length]](l) ).join(colors.white(' - ')));
        }
      }
    },

    exec: async function () {
      return new Promise(async (pass, fail) => {
        if (files.length) {
          logs = logs.concat(await readFiles(files));
        }

        self.process().filter().sort().print();
        pass();
      });
    }
  };

  return self;
}


async function readFiles(files) {
  return new Promise((pass, fail) => {
    // Loop through files
    let lines = [];

    async.map(files, function (file, next) {
      const rl = readline.createInterface({
        input: fs.createReadStream(file)
      });

      // Read file contents
      rl.on('line', line => {
        lines.push(processLine(line));
      });

      rl.on('close', next);

    }, err => {
      if (err) return fail(err);
      pass(lines);
    });
  });
}

function processLine(line) {
  let attributes = line.split(' ');
  let user_agent = '';

  for (let i = 14; i < attributes.length - 2; i++) {
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
    'request': attributes[11] +' '+ attributes[12] +' '+ attributes[13],
    'requested_resource': attributes[12],
    'user_agent': user_agent,
    'total_time': parseFloat(attributes[4]) + parseFloat(attributes[5]) + parseFloat(attributes[6])
  };
}
