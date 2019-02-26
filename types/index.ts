type CallbackFunction = (...args: any[]) => void
interface ParserOptions {
  requestedColumns: string[],
  sortBy: number,
  ascending: boolean,
  limit: number,
  prefixes: string[],
  start?: Date,
  end?: Date
}
interface LibraryOptions extends ParserOptions {
  cols: string[],
  files: string[],
  onProgress: CallbackFunction,
  onStart: (filenames: any) => void
}
