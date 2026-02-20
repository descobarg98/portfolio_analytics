type MassivePricePoint = {
  date: string
  close: number
}

type MassiveLatestPrice = {
  symbol: string
  price: number
}

type MassiveAggsResponse = {
  ticker: string
  results?: Array<{
    c: number
    t: number
  }>
}

const apiBase = import.meta.env.VITE_API_BASE || window.location.origin

const fetchMassive = async <T>(url: URL) => {
  const response = await fetch(url.toString())
  const data = await response.json()
  if (!response.ok) {
    const message = data?.message || data?.error || 'Massive API request failed.'
    throw new Error(message)
  }
  return data as T
}

const extractHistory = (payload: MassiveAggsResponse): MassivePricePoint[] => {
  if (!payload?.results?.length) return []
  return payload.results
    .map((item) => ({
      date: new Date(item.t).toISOString().slice(0, 10),
      close: Number(item.c),
    }))
    .filter((item) => item.date && Number.isFinite(item.close))
}

export const fetchLatestPrices = async (symbols: string[]) => {
  const url = new URL('/api/massive/latest', apiBase)
  url.searchParams.set('symbols', symbols.join(','))
  const payload = await fetchMassive<{ results: Array<{ symbol: string; data?: MassiveAggsResponse }> }>(url)
  const results = payload.results.map((entry) => {
    if (!entry.data) return null
    const history = extractHistory(entry.data)
    const latest = history[history.length - 1]
    return latest ? { symbol: entry.symbol, price: latest.close } : null
  })

  return results.filter((item): item is MassiveLatestPrice => Boolean(item))
}

export const fetchHistoricalPrices = async (symbol: string, startDate: string, endDate: string) => {
  const url = new URL('/api/massive/history', apiBase)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('start', startDate)
  url.searchParams.set('end', endDate)
  const payload = await fetchMassive<MassiveAggsResponse>(url)
  return extractHistory(payload)
}
