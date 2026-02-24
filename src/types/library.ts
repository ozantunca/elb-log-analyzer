export type ColumnName = keyof ParsedLine

export type ColumnValue = string | number

export interface ParserOptions {
  requestedColumns: ColumnName[]
  sortBy: number
  ascending: boolean
  limit: number
  prefixes: string[]
  start?: Date
  end?: Date
}

export interface LibraryOptions {
  cols?: ColumnName[]
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
  method: string
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
  domain_name?: string
  chosen_cert_arn?: string
  matched_rule_priority?: string
  request_creation_time?: string
  actions_executed?: string
  redirect_url?: string
  error_reason?: string
  target_port_list?: string
  target_status_code_list?: string
  classification?: string
  classification_reason?: string
  type?: string
  count?: number
}
