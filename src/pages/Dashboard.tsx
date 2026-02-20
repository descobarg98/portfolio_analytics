import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Wallet, Activity } from 'lucide-react'
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie, Legend, type AxisDomain } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  PORTFOLIO_OPTIONS,
  buildHoldingsFromTransactions,
  getPortfolioInstruments,
  getPortfolioTransactions,
  type PortfolioId,
  type PortfolioTransaction,
} from '@/lib/portfolio-data'
import { fetchHistoricalPrices, fetchLatestPrices } from '@/lib/massive'
import '../App.css'

const COLORS = ['#0B1F3A', '#12325C', '#1A477E', '#235DA0', '#2D74C2', '#3E8BE4', '#5AA1EE', '#7AB6F5', '#9CC9FA', '#B9DBFD']

const PERIOD_OPTIONS = ['1W', '1M', '3M', '6M', '1Y', '3Y', 'YTD'] as const
const PERIOD_DAYS: Record<(typeof PERIOD_OPTIONS)[number], number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '3Y': 365 * 3,
  'YTD': 0,
}

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const buildDefaultRange = () => {
  const end = new Date()
  const start = new Date()
  start.setFullYear(end.getFullYear() - 1)
  return { start: toIsoDate(start), end: toIsoDate(end) }
}

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`
const formatAxisValue = (value: number) => {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(1)}k`
  }
  return `${sign}$${Math.round(absValue)}`
}
const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours24 = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const isPm = hours24 >= 12
  const hours12 = hours24 % 12 || 12
  const meridiem = isPm ? 'PM' : 'AM'
  return `${year}-${month}-${day} ${hours12}:${minutes} ${meridiem}`
}

const computeRangePosition = (series: { date: string; close: number }[], currentPrice: number) => {
  if (!series.length || !currentPrice) return null
  const latestDate = new Date(series[series.length - 1].date)
  const cutoff = new Date(latestDate)
  cutoff.setDate(cutoff.getDate() - 365)
  const window = series.filter((point) => new Date(point.date) >= cutoff)
  if (!window.length) return null
  const closes = window.map((point) => point.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  if (max === min) return { percent: 0, min, max }
  const percent = ((currentPrice - min) / (max - min)) * 100
  return { percent, min, max }
}

const buildPriceMap = (prices: { symbol: string; price: number }[]) => {
  const map = new Map<string, number>()
  for (const price of prices) {
    map.set(price.symbol, price.price)
  }
  return map
}

const buildHistoryMap = (history: { symbol: string; data: { date: string; close: number }[] }[]) => {
  const map = new Map<string, { date: string; close: number }[]>()
  for (const entry of history) {
    map.set(entry.symbol, entry.data)
  }
  return map
}

const buildPortfolioSeries = (
  historyBySymbol: Map<string, { date: string; close: number }[]>,
  holdings: { symbol: string; shares: number }[],
) => {
  const dateSet = new Set<string>()
  const priceBySymbolDate = new Map<string, Map<string, number>>()

  for (const holding of holdings) {
    const series = historyBySymbol.get(holding.symbol) || []
    const priceMap = new Map<string, number>()
    for (const point of series) {
      const date = point.date.slice(0, 10)
      priceMap.set(date, point.close)
      dateSet.add(date)
    }
    priceBySymbolDate.set(holding.symbol, priceMap)
  }

  const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  const lastKnown = new Map<string, number>()

  return dates.map((date) => {
    let total = 0
    for (const holding of holdings) {
      const priceMap = priceBySymbolDate.get(holding.symbol)
      const price = priceMap?.get(date)
      if (price !== undefined) {
        lastKnown.set(holding.symbol, price)
      }
      const resolved = price ?? lastKnown.get(holding.symbol) ?? 0
      total += resolved * holding.shares
    }
    return { date, value: total }
  })
}

const sliceSeriesByPeriod = (series: { date: string; value: number }[], period: (typeof PERIOD_OPTIONS)[number]) => {
  if (!series.length) return []
  if (period === 'YTD') {
    const endDate = new Date(series[series.length - 1].date)
    const startDate = new Date(endDate.getFullYear(), 0, 1)
    return series.filter((point) => new Date(point.date) >= startDate)
  }
  const days = PERIOD_DAYS[period]
  const endDate = new Date(series[series.length - 1].date)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days)
  return series.filter((point) => new Date(point.date) >= startDate)
}

const computeReturn = (series: { value: number }[]) => {
  if (series.length < 2) return 0
  const start = series[0].value
  const end = series[series.length - 1].value
  if (!start) return 0
  return ((end - start) / start) * 100
}

const computeSharpeRatio = (series: { value: number }[], riskFreeRate: number) => {
  if (series.length < 2) return 0
  const returns = series.slice(1).map((point, index) => {
    const prev = series[index].value
    return prev ? (point.value - prev) / prev : 0
  })
  const avg = returns.reduce((sum, value) => sum + value, 0) / returns.length
  const variance = returns.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / returns.length
  const volatility = Math.sqrt(variance)
  const annualizedReturn = avg * 252
  const annualizedVolatility = volatility * Math.sqrt(252)
  return annualizedVolatility ? (annualizedReturn - riskFreeRate) / annualizedVolatility : 0
}

const computeSortinoRatio = (series: { value: number }[], riskFreeRate: number) => {
  if (series.length < 2) return 0
  const dailyRiskFree = riskFreeRate / 252
  const excessReturns = series.slice(1).map((point, index) => {
    const prev = series[index].value
    const dailyReturn = prev ? (point.value - prev) / prev : 0
    return dailyReturn - dailyRiskFree
  })
  const avgExcess = excessReturns.reduce((sum, value) => sum + value, 0) / excessReturns.length
  const downsideReturns = excessReturns.map((value) => Math.min(0, value))
  const downsideVariance = downsideReturns.reduce((sum, value) => sum + value * value, 0) / downsideReturns.length
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252)
  const annualizedExcess = avgExcess * 252
  return downsideDeviation ? annualizedExcess / downsideDeviation : 0
}

const computeAnnualizedVolatility = (series: { value: number }[]) => {
  if (series.length < 2) return 0
  const returns = series.slice(1).map((point, index) => {
    const prev = series[index].value
    return prev ? (point.value - prev) / prev : 0
  })
  const avg = returns.reduce((sum, value) => sum + value, 0) / returns.length
  const variance = returns.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / returns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252)
  return volatility
}

const computeMaxDrawdown = (series: { date: string; value: number }[]) => {
  if (series.length < 2) return { drawdown: 0, peakDate: '', troughDate: '' }
  let peak = series[0].value
  let peakDate = series[0].date
  let maxDrawdown = 0
  let maxPeakDate = series[0].date
  let maxTroughDate = series[0].date

  for (const point of series) {
    if (point.value > peak) {
      peak = point.value
      peakDate = point.date
    }
    const drawdown = peak ? (point.value - peak) / peak : 0
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown
      maxPeakDate = peakDate
      maxTroughDate = point.date
    }
  }

  return { drawdown: maxDrawdown, peakDate: maxPeakDate, troughDate: maxTroughDate }
}
const computeBeta = (
  portfolioSeries: { date: string; value: number }[],
  benchmarkSeries: { date: string; value: number }[],
) => {
  if (portfolioSeries.length < 2 || benchmarkSeries.length < 2) return 0
  const benchmarkMap = new Map(benchmarkSeries.map((point) => [point.date, point.value]))
  const matched = portfolioSeries
    .filter((point) => benchmarkMap.has(point.date))
    .map((point) => ({
      date: point.date,
      portfolio: point.value,
      benchmark: benchmarkMap.get(point.date) || 0,
    }))

  if (matched.length < 2) return 0

  const returns = matched.slice(1).map((point, index) => {
    const prev = matched[index]
    const portfolioReturn = prev.portfolio ? (point.portfolio - prev.portfolio) / prev.portfolio : 0
    const benchmarkReturn = prev.benchmark ? (point.benchmark - prev.benchmark) / prev.benchmark : 0
    return { portfolioReturn, benchmarkReturn }
  })

  const avgBenchmark = returns.reduce((sum, item) => sum + item.benchmarkReturn, 0) / returns.length
  const avgPortfolio = returns.reduce((sum, item) => sum + item.portfolioReturn, 0) / returns.length

  let covariance = 0
  let variance = 0
  for (const item of returns) {
    covariance += (item.benchmarkReturn - avgBenchmark) * (item.portfolioReturn - avgPortfolio)
    variance += Math.pow(item.benchmarkReturn - avgBenchmark, 2)
  }

  covariance /= returns.length
  variance /= returns.length

  return variance ? covariance / variance : 0
}

const computeAlpha = (
  portfolioSeries: { date: string; value: number }[],
  benchmarkSeries: { date: string; value: number }[],
  riskFreeRate: number,
) => {
  if (portfolioSeries.length < 2 || benchmarkSeries.length < 2) return 0
  const benchmarkMap = new Map(benchmarkSeries.map((point) => [point.date, point.value]))
  const matched = portfolioSeries
    .filter((point) => benchmarkMap.has(point.date))
    .map((point) => ({
      date: point.date,
      portfolio: point.value,
      benchmark: benchmarkMap.get(point.date) || 0,
    }))

  if (matched.length < 2) return 0

  const returns = matched.slice(1).map((point, index) => {
    const prev = matched[index]
    const portfolioReturn = prev.portfolio ? (point.portfolio - prev.portfolio) / prev.portfolio : 0
    const benchmarkReturn = prev.benchmark ? (point.benchmark - prev.benchmark) / prev.benchmark : 0
    return { portfolioReturn, benchmarkReturn }
  })

  const avgPortfolio = returns.reduce((sum, item) => sum + item.portfolioReturn, 0) / returns.length
  const avgBenchmark = returns.reduce((sum, item) => sum + item.benchmarkReturn, 0) / returns.length

  const annualPortfolio = avgPortfolio * 252
  const annualBenchmark = avgBenchmark * 252
  const beta = computeBeta(portfolioSeries, benchmarkSeries)
  return annualPortfolio - (riskFreeRate + beta * (annualBenchmark - riskFreeRate))
}
const resolveCloseForDate = (series: { date: string; close: number }[], targetDate: string) => {
  if (!series.length) return 0
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date))
  let lastClose: number | null = null
  for (const point of sorted) {
    if (point.date <= targetDate) {
      lastClose = point.close
    } else {
      break
    }
  }
  return lastClose ?? 0
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof PERIOD_OPTIONS)[number]>('1Y')
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioId | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const transactions = useMemo<PortfolioTransaction[]>(
    () => (selectedPortfolio ? getPortfolioTransactions(selectedPortfolio) : []),
    [selectedPortfolio],
  )

  const instruments = useMemo(
    () => (selectedPortfolio ? getPortfolioInstruments(selectedPortfolio) : []),
    [selectedPortfolio],
  )

  const instrumentSectorMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const instrument of instruments) {
      map.set(instrument.symbol, instrument.sector)
    }
    return map
  }, [instruments])

  const symbols = useMemo(() => {
    const set = new Set(instruments.map((item) => item.symbol))
    set.add('SPY')
    set.add('QQQ')
    set.add('DIA')
    return Array.from(set)
  }, [instruments])

  const dateRange = useMemo(() => {
    if (!transactions.length) return buildDefaultRange()
    const timestamps = transactions.map((tx) => new Date(tx.date).getTime())
    const minDate = new Date(Math.min(...timestamps))
    const endDate = new Date()
    return { start: toIsoDate(minDate), end: toIsoDate(endDate) }
  }, [transactions])

  const latestPricesQuery = useQuery({
    queryKey: ['massive', 'latest', symbols],
    queryFn: () => fetchLatestPrices(symbols),
    enabled: Boolean(selectedPortfolio) && symbols.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  })

  const historyQuery = useQuery({
    queryKey: ['massive', 'history', symbols, dateRange.start, dateRange.end],
    queryFn: async () => {
      const results = await Promise.all(
        symbols.map(async (symbol) => ({
          symbol,
          data: await fetchHistoricalPrices(symbol, dateRange.start, dateRange.end),
        })),
      )
      return results
    },
    enabled: Boolean(selectedPortfolio) && symbols.length > 0,
    staleTime: 1000 * 60 * 30,
  })

  const latestPriceMap = useMemo(
    () => buildPriceMap(latestPricesQuery.data ?? []),
    [latestPricesQuery.data],
  )

  const historyMap = useMemo(
    () => buildHistoryMap(historyQuery.data ?? []),
    [historyQuery.data],
  )

  const rangePositionMap = useMemo(() => {
    const map = new Map<string, { percent: number }>()
    for (const [symbol, series] of historyMap.entries()) {
      const currentPrice = latestPriceMap.get(symbol) ?? 0
      const result = computeRangePosition(series, currentPrice)
      if (result) {
        map.set(symbol, { percent: result.percent })
      }
    }
    return map
  }, [historyMap, latestPriceMap])

  const enrichedTransactions = useMemo<PortfolioTransaction[]>(() => {
    if (!selectedPortfolio) return []
    return transactions.map((tx) => {
      const series = historyMap.get(tx.symbol) || []
      const resolvedPrice = resolveCloseForDate(series, tx.date)
      return { ...tx, price: resolvedPrice }
    })
  }, [selectedPortfolio, transactions, historyMap])

  const holdings = useMemo(() => {
    if (!selectedPortfolio) return []
    const baseHoldings = buildHoldingsFromTransactions(enrichedTransactions, instruments)
    return baseHoldings.map((holding) => {
      const currentPrice = latestPriceMap.get(holding.symbol) ?? 0
      return {
        ...holding,
        currentPrice,
        value: currentPrice * holding.shares,
      }
    })
  }, [selectedPortfolio, enrichedTransactions, instruments, latestPriceMap])

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const aCost = a.costBasis * a.shares
      const bCost = b.costBasis * b.shares
      const aPct = aCost ? (a.value - aCost) / aCost : 0
      const bPct = bCost ? (b.value - bCost) / bCost : 0
      return bPct - aPct
    })
  }, [holdings])

  const topHoldings = useMemo(() => {
    return [...holdings]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [holdings])

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const totalCost = holdings.reduce((sum, holding) => sum + holding.shares * holding.costBasis, 0)
  const totalGainLoss = totalValue - totalCost

  const sectorAllocation = holdings.reduce((acc: Record<string, number>, holding) => {
    acc[holding.sector] = (acc[holding.sector] || 0) + holding.value
    return acc
  }, {})

  const sectorData = useMemo(() => {
    const entries = Object.entries(sectorAllocation)
      .map(([sector, value]) => ({
        name: sector,
        value,
        percentage: totalValue ? ((value / totalValue) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.value - a.value)

    if (entries.length <= 9) return entries

    const top = entries.slice(0, 9)
    const rest = entries.slice(9)
    const otherValue = rest.reduce((sum, entry) => sum + entry.value, 0)
    const otherPercent = totalValue ? ((otherValue / totalValue) * 100).toFixed(1) : '0.0'
    return [...top, { name: 'Other', value: otherValue, percentage: otherPercent }]
  }, [sectorAllocation, totalValue])

  const portfolioHistory = useMemo(() => {
    if (!selectedPortfolio || !holdings.length) return []
    return buildPortfolioSeries(historyMap, holdings)
  }, [selectedPortfolio, holdings, historyMap])

  const benchmarkSeries = useMemo(() => {
    const map = new Map<string, { date: string; value: number }[]>()
    for (const symbol of ['SPY', 'QQQ', 'DIA']) {
      const series = historyMap.get(symbol) || []
      map.set(
        symbol,
        series.map((point) => ({ date: point.date.slice(0, 10), value: point.close })),
      )
    }
    return map
  }, [historyMap])

  const filteredPortfolioSeries = useMemo(
    () => sliceSeriesByPeriod(portfolioHistory, selectedPeriod),
    [portfolioHistory, selectedPeriod],
  )

  const yAxisDomain = useMemo<AxisDomain>(() => {
    if (!filteredPortfolioSeries.length) return ['auto', 'auto']
    const values = filteredPortfolioSeries.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }, [filteredPortfolioSeries])

  const xAxisTicks = useMemo(() => {
    if (filteredPortfolioSeries.length < 3) {
      return filteredPortfolioSeries.map((point) => point.date)
    }
    const first = filteredPortfolioSeries[0].date
    const last = filteredPortfolioSeries[filteredPortfolioSeries.length - 1].date
    const middle = filteredPortfolioSeries[Math.floor(filteredPortfolioSeries.length / 2)].date
    return [first, middle, last]
  }, [filteredPortfolioSeries])

  const portfolioPeriodReturn = useMemo(() => {
    if (filteredPortfolioSeries.length < 2) {
      return { dollar: 0, percent: 0 }
    }
    const startValue = filteredPortfolioSeries[0].value
    const endValue = filteredPortfolioSeries[filteredPortfolioSeries.length - 1].value
    const dollar = endValue - startValue
    const percent = startValue ? (dollar / startValue) * 100 : 0
    return { dollar, percent }
  }, [filteredPortfolioSeries])

  const filteredSp500Series = useMemo(
    () => sliceSeriesByPeriod(benchmarkSeries.get('SPY') || [], selectedPeriod),
    [benchmarkSeries, selectedPeriod],
  )

  const filteredNasdaqSeries = useMemo(
    () => sliceSeriesByPeriod(benchmarkSeries.get('QQQ') || [], selectedPeriod),
    [benchmarkSeries, selectedPeriod],
  )

  const filteredDjiSeries = useMemo(
    () => sliceSeriesByPeriod(benchmarkSeries.get('DIA') || [], selectedPeriod),
    [benchmarkSeries, selectedPeriod],
  )

  const sp500Return = computeReturn(filteredSp500Series)
  const nasdaqReturn = computeReturn(filteredNasdaqSeries)
  const djiReturn = computeReturn(filteredDjiSeries)

  const performanceMessage = useMemo(() => {
    if (!filteredPortfolioSeries.length) return 'Underperformed'
    return portfolioPeriodReturn.percent >= sp500Return ? 'Beat' : 'Underperformed'
  }, [filteredPortfolioSeries, portfolioPeriodReturn.percent, sp500Return])

  const riskFreeRate = 0.04
  const sharpeRatio = computeSharpeRatio(filteredPortfolioSeries, riskFreeRate)
  const sortinoRatio = computeSortinoRatio(filteredPortfolioSeries, riskFreeRate)
  const betaVsSp500 = computeBeta(filteredPortfolioSeries, filteredSp500Series)
  const alphaVsSp500 = computeAlpha(filteredPortfolioSeries, filteredSp500Series, riskFreeRate)
  const portfolioVolatility = computeAnnualizedVolatility(filteredPortfolioSeries)
  const maxDrawdown = computeMaxDrawdown(filteredPortfolioSeries)

  const recentTransactions = useMemo(
    () => [...enrichedTransactions].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()),
    [enrichedTransactions],
  )

  const visibleTransactions = useMemo(() => {
    if (showAllTransactions) return recentTransactions
    return recentTransactions.slice(0, 20)
  }, [recentTransactions, showAllTransactions])

  const showSkeletons = !selectedPortfolio || latestPricesQuery.isLoading || historyQuery.isLoading
  const pricingError = latestPricesQuery.error || historyQuery.error

  const handlePortfolioSelect = (portfolioId: PortfolioId) => {
    setSelectedPortfolio(portfolioId)
    setIsDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 dark">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}sharpeful-logo.png`}
              alt="Sharpeful"
              className="h-20 w-20"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-100">Sharpeful</h1>
              <p className="text-zinc-400">Portfolio analytics & insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedPortfolio ? (
              <Badge variant="secondary">
                {PORTFOLIO_OPTIONS.find((option) => option.id === selectedPortfolio)?.name}
              </Badge>
            ) : null}
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Connect Brokerage Account
            </Button>
            <Button variant="outline" onClick={() => { logout(); navigate('/login', { replace: true }) }}>
              Logout
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user?.profile.avatarUrl} />
                  <AvatarFallback>{user?.profile.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.profile.name ?? user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate('/login', { replace: true }) }}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {pricingError && (
          <div className="text-sm text-red-600">
            Pricing data is unavailable. Check your Massive API settings.
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a portfolio</DialogTitle>
              <DialogDescription>
                Choose a portfolio to load
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              {PORTFOLIO_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="justify-between"
                  onClick={() => handlePortfolioSelect(option.id)}
                >
                  <span>{option.name}</span>
                  <span className="text-xs text-zinc-400">Load data</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <div className="text-xl font-bold">{formatCurrency(totalValue)}</div>
                  <p className={`text-base font-semibold ${portfolioPeriodReturn.dollar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioPeriodReturn.dollar >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioPeriodReturn.dollar))} ({portfolioPeriodReturn.percent.toFixed(2)}%)
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Sum of current holdings value using latest Massive prices.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className={`text-xl font-bold ${sharpeRatio >= 1 ? 'text-green-600' : sharpeRatio >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sharpeRatio.toFixed(2)}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Risk-adjusted return
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Risk-adjusted return using daily portfolio returns and 4% risk-free rate.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sortino Ratio</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className={`text-xl font-bold ${sortinoRatio >= 1 ? 'text-green-600' : sortinoRatio >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {sortinoRatio.toFixed(2)}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Downside risk-adjusted return
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Return versus downside volatility using a 4% risk-free rate.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beta</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-xl font-bold text-zinc-100">
                    {betaVsSp500.toFixed(2)}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Sensitivity to benchmark
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Sensitivity of portfolio returns versus SPY in the selected period.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alpha</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className={`text-xl font-bold ${alphaVsSp500 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {alphaVsSp500 >= 0 ? '+' : ''}{(alphaVsSp500 * 100).toFixed(2)}%
                  </div>
                  <p className="text-xs text-zinc-400">
                    Annualized excess return vs SPY
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Alpha based on annualized returns and beta versus SPY.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className={`text-base font-semibold ${portfolioPeriodReturn.percent >= sp500Return ? 'text-green-600' : 'text-red-600'}`}>
                    {performanceMessage}
                  </div>
                  <p className="text-xs text-zinc-400">
                    S&P 500 Benchmark
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Compares portfolio return to SPY over the selected period.
            </TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="-mt-2">
          <CardContent className="py-3">
            {showSkeletons ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-48" />
              </div>
            ) : (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-zinc-100">
                  S&P 500:  {' '}
                  <span className={sp500Return >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {sp500Return >= 0 ? '+' : ''}{sp500Return.toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-100">
                  NASDAQ 100:  {' '}
                  <span className={nasdaqReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {nasdaqReturn >= 0 ? '+' : ''}{nasdaqReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-100">
                  DJI:  {' '}
                  <span className={djiReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {djiReturn >= 0 ? '+' : ''}{djiReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            Benchmark returns for SPY, QQQ, and DIA over the selected period.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-none -mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div />
              <div className="flex space-x-2">
                {PERIOD_OPTIONS.map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {showSkeletons ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredPortfolioSeries} margin={{ top: 24, right: 24, left: 8, bottom: 12 }}>
                    <XAxis
                      dataKey="date"
                      ticks={xAxisTicks}
                      interval={0}
                      tickFormatter={formatDateLabel}
                      tickMargin={14}
                      tick={(props) => {
                        const { x, y, payload } = props
                        const index = xAxisTicks.indexOf(String(payload?.value))
                        const textAnchor = index === 0 ? 'start' : index === 1 ? 'middle' : 'end'
                        return (
                          <text x={x} y={y} dy={16} textAnchor={textAnchor} fill="#94a3b8">
                            {formatDateLabel(String(payload?.value))}
                          </text>
                        )
                      }}
                    />
                    <YAxis
                      domain={yAxisDomain}
                      tickFormatter={(value) => formatAxisValue(Number(value))}
                      orientation="right"
                      width={90}
                      tickMargin={14}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, '']}
                      labelFormatter={(label) => formatDateLabel(String(label))}
                      separator=""
                      contentStyle={{ borderRadius: '8px', opacity: 0.9, backgroundColor: '#000000', padding: '4px 6px', border: 'none' }}
                      itemStyle={{ fontSize: 14, fontWeight: 600, color: '#ffffff', margin: 0, padding: 0 }}
                      labelStyle={{ fontSize: 10, display: 'block', marginBottom: 2, color: '#ffffff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ffffff"
                      fill="#122740"
                      fillOpacity={1}
                      strokeWidth={2}
                      name="Portfolio"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            Portfolio value time series from Massive daily closes.
          </TooltipContent>
        </Tooltip>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings Summary</CardTitle>
              <Wallet className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ) : (
                <>
                  <div className="text-sm text-zinc-100">
                    Total Holdings: <span className="font-semibold">{holdings.length}</span>
                  </div>
                  <div className="text-sm text-zinc-100">
                    Sectors: <span className="font-semibold">{sectorData.length}</span>
                  </div>
                  <div className="text-sm text-zinc-100">
                    Top Holdings:
                    {topHoldings.length ? (
                      <div className="mt-1 font-semibold">
                        {topHoldings
                          .map((holding) => {
                            const percent = totalValue > 0 ? Math.round((holding.value / totalValue) * 100) : 0
                            return `${holding.symbol} ${percent}%`
                          })
                          .map((label, index) => (
                            <div key={label} className="text-zinc-100 ml-3">
                              {index + 1}. {label}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="font-semibold">—</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Summary of holdings count, sector count, and largest position.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={sectorData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                      >
                        {sectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(_value: number, _name: string, payload) => {
                          const percent = Number(payload?.payload?.percentage ?? 0)
                          return [`${payload?.name || ''} ${Math.round(percent)}%`, '']
                        }}
                        labelFormatter={() => ''}
                        separator=""
                        contentStyle={{ padding: '4px 6px', fontSize: '10px', opacity: 0.7 }}
                      />
                      <Legend
                        align="left"
                        layout="vertical"
                        verticalAlign="middle"
                        wrapperStyle={{ fontSize: 10 }}
                        formatter={(value) => (
                          <span style={{ color: '#ffffff' }}>{value}</span>
                        )}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Share of total portfolio value by sector.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volatility</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-zinc-100">
                    {(portfolioVolatility * 100).toFixed(2)}%
                  </div>
                  <p className="text-xs text-zinc-400">
                    Annualized volatility from daily returns
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Standard deviation of daily returns, annualized.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              <Activity className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              {showSkeletons ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-zinc-100">
                    {(maxDrawdown.drawdown * 100).toFixed(2)}%
                  </div>
                  <p className="text-xs text-zinc-400">
                    {maxDrawdown.peakDate && maxDrawdown.troughDate
                      ? `${formatDateLabel(maxDrawdown.peakDate)} → ${formatDateLabel(maxDrawdown.troughDate)}`
                      : 'Largest peak-to-trough decline'}
                  </p>
                </>
              )}
            </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Worst drawdown over the available history.
            </TooltipContent>
          </Tooltip>

        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Current portfolio positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Cost Basis</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">$ Total G/L</TableHead>
                    <TableHead className="text-right">% Total G/L</TableHead>
                    <TableHead className="text-right">52W Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showSkeletons ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={`holding-skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    sortedHoldings.map((holding) => (
                      (() => {
                        const totalCost = holding.costBasis * holding.shares
                        const totalGl = holding.value - totalCost
                        const totalGlPercent = totalCost ? (totalGl / totalCost) * 100 : 0
                        const rangePosition = rangePositionMap.get(holding.symbol)
                        return (
                      <TableRow key={holding.symbol}>
                        <TableCell className="font-medium">{holding.symbol}</TableCell>
                        <TableCell>{holding.name}</TableCell>
                        <TableCell>{holding.sector}</TableCell>
                        <TableCell className="text-right">{holding.shares}</TableCell>
                        <TableCell className="text-right">${holding.costBasis.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.value)}</TableCell>
                        <TableCell className={`text-right ${totalGl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalGl >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalGl))}
                        </TableCell>
                        <TableCell className={`text-right ${totalGlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {totalGlPercent >= 0 ? '+' : ''}{totalGlPercent.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-zinc-200">
                          {rangePosition ? `${Math.round(rangePosition.percent)}%` : '—'}
                        </TableCell>
                      </TableRow>
                        )
                      })()
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            Positions built from simulated trades and Massive prices.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card>
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Latest portfolio activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showSkeletons ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={`txn-skeleton-${index}`}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-14" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    visibleTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDateTime(tx.datetime)}</TableCell>
                        <TableCell>{tx.symbol}</TableCell>
                        <TableCell>{instrumentSectorMap.get(tx.symbol) ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'buy' ? 'secondary' : 'destructive'}>
                            {tx.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{tx.quantity}</TableCell>
                        <TableCell className="text-right">
                          {tx.price ? `$${tx.price.toFixed(2)}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!showSkeletons && recentTransactions.length > 20 ? (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setShowAllTransactions((prev) => !prev)}>
                    {showAllTransactions ? 'Show less' : 'See more'}
                  </Button>
                </div>
              ) : null}
            </div>
          </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            Most recent trades with prices from nearest prior close.
          </TooltipContent>
        </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
