#! /usr/bin/env node
import lib from './lib'
import _ from 'lodash'
import ProgressBar from 'progress'
import fs from 'fs'
import path from 'path'
import { CLIOptions } from './types/cli'
import { LibraryOptions } from './types/library'

const USEFUL_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']

const colors: any = require('colors/safe')
const options: CLIOptions = require('optimist').argv
const files = options._
let bar: ProgressBar

if (options.version || options.v) {
  const content = fs.readFileSync(path.join(__dirname, '/../package.json')).toString()
  console.log(JSON.parse(content).version)
  process.exit()
}

if (!files.length) {
  handler(new Error('No argument or file specified'))
  process.exit()
}

options.sortBy = options.sortBy || options.s || 1

if (typeof options.sortBy !== 'number') {
  handler(new Error('--sortBy must be a number'))
  process.exit()
}

// Assign default columns
const parsedOptions: LibraryOptions = {
  files,
  cols: ['count', 'requested_resource'],
  prefixes: [],
  sortBy: options.sortBy - 1, // lib.js accepts sortBy starting with 0 while cli accepts starting with 1
  limit: options.limit || 10,
  ascending: options.a
}

if (!_.isEmpty(options.start)) {
  options.start = String(options.start)

  if ((new Date(options.start)).toString() === 'Invalid Date') {
    handler(new Error('Start date is invalid'))
    process.exit()
  } else {
    parsedOptions.start = new Date(options.start)
  }
}

if (!_.isEmpty(options.end)) {
  options.end = String(options.end)

  if ((new Date(options.end)).toString() === 'Invalid Date') {
    handler(new Error('End date is invalid'))
    process.exit()
  } else {
    parsedOptions.end = new Date(options.end)
  }
}

// Parse prefixes and column choices
_.each(options, function (arg: any, key: string) {
  let match = key.match(/^p(refix){0,1}([0-9]+)$/)

  if (match && !isNaN(Number(match[2]))) {
    const index: number = Number(match[2]) - 1
    parsedOptions.prefixes[index] = arg
    return
  }

  match = key.match(/^c(ol){0,1}([0-9]+)$/)

  if (match && !isNaN(Number(match[2]))) {
    const index: number = Number(match[2]) - 1
    parsedOptions.cols[index] = arg
  }
})

lib({
  ...parsedOptions,
  onProgress () {
    bar.tick()
  },
  onStart (filenames: string[]) {
    bar = new ProgressBar(' processing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: filenames.length
    })
  }
})
  .then(function (logs: any) {
    _.each(logs, (log: string[][], i: number) => {
      const coloredText: string = _.map<string[], string>(log, (l: string[], index: number) => {
        const colorName: string = USEFUL_COLORS[index % USEFUL_COLORS.length]
        return colors[colorName](l)
      })
        .join(colors.white(' - '))

      console.log(colors.white(String(i + 1)) + ' - ' + coloredText)
    })
  })
  .catch(handler)

function handler (err: Error) {
  console.log(`${colors.red('An error occured')}: `, colors.cyan(err.toString()))
}
