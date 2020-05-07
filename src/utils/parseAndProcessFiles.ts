import fs from 'fs'
import readline from 'readline'
import map from 'lodash/map'

// Reads files line by line and passes them
// to the processor function
export const parseAndProcessFiles = async (
  fileNames: string[],
  processFunc: Function,
  onProgress: Function
) =>
  Promise.all(
    map(
      fileNames,
      (fileName: string) =>
        new Promise((resolve: Function) => {
          const RL = readline.createInterface({
            terminal: false,
            input: fs.createReadStream(fileName),
          })

          // Read file contents
          RL.on('line', (line: string) => {
            processFunc(line)
          })

          RL.on('close', () => {
            onProgress()
            resolve()
          })
        })
    )
  )
