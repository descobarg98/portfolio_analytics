import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const app = express()

app.use(express.json())

const ENV_PATH = path.resolve(process.cwd(), 'server/.env.local')

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) return
  const contents = readFileSync(filePath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile(ENV_PATH)

const MASSIVE_API_KEY = process.env.MASSIVE_API_KEY
const MASSIVE_BASE_URL = process.env.MASSIVE_API_BASE_URL || 'https://api.massive.com/v2'
const PORT = Number(process.env.MASSIVE_SERVER_PORT || process.env.PORT || 8000)
const APP_ORIGINS = (process.env.APP_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && APP_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (!origin && APP_ORIGINS.length > 0) {
    res.setHeader('Access-Control-Allow-Origin', APP_ORIGINS[0])
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  next()
})

const buildAggsUrl = (symbol, startDate, endDate, limit) => {
  if (!MASSIVE_API_KEY) {
    throw new Error('Missing MASSIVE_API_KEY.')
  }

  const url = new URL(
    `${MASSIVE_BASE_URL}/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${startDate}/${endDate}`,
  )
  url.searchParams.set('adjusted', 'true')
  url.searchParams.set('sort', 'asc')
  url.searchParams.set('limit', String(limit ?? 120))
  url.searchParams.set('apiKey', MASSIVE_API_KEY)
  return url
}

app.get('/api/massive/history', async (req, res) => {
  try {
    const { symbol, start, end } = req.query
    if (!symbol || !start || !end) {
      res.status(400).json({ error: 'Missing symbol, start, or end.' })
      return
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const limit = Math.min(1000, days + 10)

    const url = buildAggsUrl(symbol, start, end, limit)
    const response = await fetch(url.toString())
    const data = await response.json()
    if (!response.ok) {
      res.status(response.status).json(data)
      return
    }
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Massive request failed.' })
  }
})

app.get('/api/massive/latest', async (req, res) => {
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (symbols.length === 0) {
      res.status(400).json({ error: 'Missing symbols.' })
      return
    }

    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 7)
    const startDate = start.toISOString().slice(0, 10)
    const endDate = end.toISOString().slice(0, 10)

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const url = buildAggsUrl(symbol, startDate, endDate, 120)
        const response = await fetch(url.toString())
        const data = await response.json()
        if (!response.ok) {
          return { symbol, error: data }
        }
        return { symbol, data }
      }),
    )

    res.json({ results })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Massive request failed.' })
  }
})

app.listen(PORT, () => {
  console.log(`Massive proxy server running on http://localhost:${PORT}`)
})
