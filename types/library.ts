export type Column =  'type' | 'timestamp' | 'elb' | 'client:port' | 'client' | 'backend:port' | 'backend' | 'request_processing_time' |
'backend_processing_time' | 'response_processing_time' | 'elb_status_code' | 'backend_status_code' |
'received_bytes' | 'sent_bytes' | 'request' | 'requested_resource' | 'user_agent' | 'total_time' | 'count' |
'target_group_arn' | 'trace_id' | 'ssl_cipher' | 'ssl_protocol'

export interface ParserOptions {
  requestedColumns: Column[],
  sortBy: number,
  ascending: boolean,
  limit: number,
  prefixes: string[],
  start?: Date,
  end?: Date
}

export interface LibraryOptions {
  cols: Column[]
  files: string[]
  prefixes: string[]
  sortBy: number
  limit?: number
  ascending?: boolean
  start?: Date
  end?: Date
  onProgress?: Function
  onStart?: (filenames: string[]) => void
}

export interface ParsedLine {
  timestamp: string
  elb: string
  client: string
  'client:port': string
  backend: string
  'backend:port': string
  request_processing_time: number
  backend_processing_time: number
  response_processing_time: number
  elb_status_code: string
  backend_status_code: string
  received_bytes: string
  sent_bytes: string
  request: string
  requested_resource: string
  user_agent: string
  total_time: number
  ssl_cipher: string
  ssl_protocol: string
  target_group_arn: string
  trace_id: string
  type?: string
  [key: string]: number | string | undefined
}
