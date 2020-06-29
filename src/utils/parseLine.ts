import { URL } from 'url'

import { ParsedLine } from '../types/library'

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
  const parsedURLWithCorrectKeys: { [key: string]: any } = {}

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
    parsedURLWithCorrectKeys[`requested_resource.${key}`] = parsedURL[key]
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
    request: ATTRIBUTES[11],
    requested_resource: requestedResource,
    user_agent: ATTRIBUTES[12],
    total_time: Number(ATTRIBUTES[4]) + Number(ATTRIBUTES[5]) + Number(ATTRIBUTES[6]),
    ssl_cipher: ATTRIBUTES[13],
    ssl_protocol: ATTRIBUTES[14],
    target_group_arn: ATTRIBUTES[15],
    trace_id: ATTRIBUTES[16],
    type,
    ...parsedURLWithCorrectKeys,
  }

  return parsedLine
}
