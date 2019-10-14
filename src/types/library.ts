/* eslint-disable camelcase */
export type Column =
  | 'type'
  | 'timestamp'
  | 'elb'
  | 'client:port'
  | 'client'
  | 'backend:port'
  | 'backend'
  | 'request_processing_time'
  | 'backend_processing_time'
  | 'response_processing_time'
  | 'elb_status_code'
  | 'backend_status_code'
  | 'received_bytes'
  | 'sent_bytes'
  | 'request'
  | 'requested_resource'
  | 'user_agent'
  | 'total_time'
  | 'count'
  | 'target_group_arn'
  | 'trace_id'
  | 'ssl_cipher'
  | 'ssl_protocol'
  | 'requested_resource.pathname'
  | 'requested_resource.host'
  | 'requested_resource.protocol'
  | 'requested_resource.port'
  | 'requested_resource.hostname'
  | 'requested_resource.path'
  | 'requested_resource.origin'
  | 'requested_resource.search'
  | 'requested_resource.href'
  | 'requested_resource.hash'
  | 'requested_resource.searchParams'
  | 'requested_resource.username'
  | 'requested_resource.password'

export interface ParserOptions {
  requestedColumns: Column[]
  sortBy: number
  ascending: boolean
  limit: number
  prefixes: string[]
  start?: Date
  end?: Date
}

export interface LibraryOptions {
  cols?: Column[]
  files: string[]
  prefixes?: string[]
  sortBy?: number
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
  'requested_resource.pathname'?: string
  'requested_resource.host'?: string
  'requested_resource.protocol'?: string
  'requested_resource.port'?: string
  'requested_resource.hostname'?: string
  'requested_resource.path'?: string
  'requested_resource.origin'?: string
  'requested_resource.search'?: string
  'requested_resource.href'?: string
  'requested_resource.hash'?: string
  'requested_resource.searchParams'?: string
  'requested_resource.username'?: string
  'requested_resource.password'?: string
  user_agent: string
  total_time: number
  ssl_cipher: string
  ssl_protocol: string
  target_group_arn: string
  trace_id: string
  type?: string
  [key: string]: number | string | undefined
}
