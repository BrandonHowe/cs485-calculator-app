import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { calculate } = require('./calculator.js')

const corsOrigin = process.env.CORS_ORIGIN || '*'

function getHttpMethod(event = {}) {
  return (
    event?.requestContext?.http?.method
    || event?.httpMethod
    || event?.method
    || 'POST'
  )
}

function parsePayload(event = {}) {
  if (typeof event !== 'object' || event === null) {
    return {}
  }

  if (typeof event.expression === 'string') {
    return { expression: event.expression }
  }

  if (typeof event.body === 'string') {
    try {
      const body = JSON.parse(event.body)
      return body || {}
    } catch (error) {
      return { __parseError: error.message }
    }
  }

  return event
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  }
}

function optionsResponse() {
  return {
    statusCode: 200,
    headers: corsHeaders(),
  }
}

export const handler = async (event = {}) => {
  const method = getHttpMethod(event)

  if (method === 'OPTIONS') {
    return optionsResponse()
  }

  if (method !== 'POST') {
    return response(405, {
      error: 'Method not allowed',
    })
  }

  const parsed = parsePayload(event)

  if (parsed.__parseError) {
    return response(400, {
      error: `Invalid JSON body: ${parsed.__parseError}`,
    })
  }

  if (typeof parsed.expression !== 'string') {
    return response(400, {
      error: 'Missing or invalid expression',
    })
  }

  try {
    const result = calculate(parsed.expression)
    return response(200, { result })
  } catch (error) {
    return response(400, {
      error: error.message || 'Unable to evaluate expression',
    })
  }
}
