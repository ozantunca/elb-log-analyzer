import { glob } from 'glob'
import flatten from 'lodash/flatten'

export const collectFileNames = async (files: string[]): Promise<string[]> =>
  Promise.all(
    files.map(async (fileName: string) => {
      let fileList: string[] = await glob(fileName + '/**/*', { nodir: true })
      if (!fileList || !fileList.length) {
        fileList = await glob(fileName, { nodir: true })

        if (!fileList || !fileList.length) {
          throw new Error(`No file with name '${fileName}' found.`)
        }
      }
      return fileList
    })
  ).then((results) => flatten(results))
