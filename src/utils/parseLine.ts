import { URL } from 'url'
import reduce from 'lodash/reduce'

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

export function parseLine(line: string): ParsedLine | undefined {
  const ATTRIBUTES = line.match(/[^\s"']+|"([^"]*)"/gi)
  if (!ATTRIBUTES) {
    return
  }

  let type: string | undefined

  if (isNaN(new Date(ATTRIBUTES[0]).getTime())) {
    type = ATTRIBUTES.shift()
  }

  const requestedResource = String(ATTRIBUTES[11]).split(' ')[1]
  const parsedURL = new URL(requestedResource)

  const parsedLine: ParsedLine = {
    timestamp: ATTRIBUTES[0],
    elb: ATTRIBUTES[1],
    client: String(ATTRIBUTES[2]).split(':')[0],
    'client:port': ATTRIBUTES[2],
    backend: String(ATTRIBUTES[3]).split(':')[0],
    'backend:port': ATTRIBUTES[3],
    request_processing_time: Number(ATTRIBUTES[4]),
    backend_processing_time: Number(ATTRIBUTES[5]),
    response_processing_time: Number(ATTRIBUTES[6]),
    elb_status_code: ATTRIBUTES[7],
    backend_status_code: ATTRIBUTES[8],
    received_bytes: ATTRIBUTES[9],
    sent_bytes: ATTRIBUTES[10],
    request: ATTRIBUTES[11],
    requested_resource: requestedResource,
    ...reduce(
      parsedURL,
      (merged, current, key) => ({
        ...merged,
        [`requested_resource.${key}`]: current,
      }),
      {}
    ),
    user_agent: ATTRIBUTES[12],
    total_time: Number(ATTRIBUTES[4]) + Number(ATTRIBUTES[5]) + Number(ATTRIBUTES[6]),
    ssl_cipher: ATTRIBUTES[13],
    ssl_protocol: ATTRIBUTES[14],
    target_group_arn: ATTRIBUTES[15],
    trace_id: ATTRIBUTES[16],
    type,
  }

  return parsedLine
}
