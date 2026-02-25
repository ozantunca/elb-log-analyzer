import { URL } from 'url'

import { ParsedLine } from '../types/library'

function safeDecodeURI(s: string): string {
  try {
    return decodeURI(s)
  } catch {
    return s
  }
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

  const requestField = String(ATTRIBUTES[11])
  const [method, requestedResource] = requestField.split(' ')
  let parsedURL: URL | Record<string, unknown> = {}
  try {
    parsedURL = new URL(requestedResource)
  } catch (err) {}
  const parsedURLWithCorrectKeys: Record<string, any> = {}

  ;([
    'host',
    'hostname',
    'href',
    'pathname',
    'protocol',
    'port',
    'search',
    'username',
    'password',
    'origin',
    'searchParams',
    'hash',
  ] as (keyof URL)[]).forEach((key: keyof URL) => {
    const value = parsedURL[key] || '[invalid URL]'
    parsedURLWithCorrectKeys[`requested_resource.${key}`] =
      ['path', 'pathname'].includes(key) && typeof value === 'string'
        ? safeDecodeURI(value)
        : value
  })

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
    request: safeDecodeURI(requestField),
    method: method.substring(1),
    requested_resource: safeDecodeURI(requestedResource),
    user_agent: ATTRIBUTES[12],
    total_time: Number(ATTRIBUTES[4]) + Number(ATTRIBUTES[5]) + Number(ATTRIBUTES[6]),
    ssl_cipher: ATTRIBUTES[13],
    ssl_protocol: ATTRIBUTES[14],
    target_group_arn: ATTRIBUTES[15],
    trace_id: ATTRIBUTES[16],
    domain_name: ATTRIBUTES[17],
    chosen_cert_arn: ATTRIBUTES[18],
    matched_rule_priority: ATTRIBUTES[19],
    request_creation_time: ATTRIBUTES[20],
    actions_executed: ATTRIBUTES[21],
    redirect_url: ATTRIBUTES[22],
    error_reason: ATTRIBUTES[23],
    target_port_list: ATTRIBUTES[24],
    target_status_code_list: ATTRIBUTES[25],
    classification: ATTRIBUTES[26],
    classification_reason: ATTRIBUTES[27],
    type,
    ...parsedURLWithCorrectKeys,
  }

  return parsedLine
}
