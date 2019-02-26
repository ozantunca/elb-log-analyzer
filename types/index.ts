type CallbackFunction = (...args: any[]) => void
type FilterFunction = (...args: any[]) => Boolean
interface ParserOptions {
  requestedColumns?: string[],
  sortBy: number,
  ascending: boolean,
  limit: number,
  prefixes: string[],
  start?: Date,
  end?: Date
}
interface LibraryOptions extends ParserOptions {
  files: string[],
  onProgress: CallbackFunction,
  onStart: CallbackFunction
}
