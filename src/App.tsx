import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import './App.css'

const realHoldings = [
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', shares: 5, costBasis: 462.01, currentPrice: 485, sector: 'Large Cap Equity' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', shares: 3, costBasis: 395.31, currentPrice: 420, sector: 'Technology' },
  { symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate Bond ETF', shares: 4, costBasis: 72.81, currentPrice: 75, sector: 'Fixed Income' },
  { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF', shares: 5, costBasis: 44.77, currentPrice: 48, sector: 'Financial' },
  { symbol: 'XOP', name: 'SPDR S&P Oil & Gas Exploration ETF', shares: 6, costBasis: 132.54, currentPrice: 140, sector: 'Energy' },
  { symbol: 'VIXY', name: 'ProShares VIX Short-Term Futures ETF', shares: 1, costBasis: 10.19, currentPrice: 12, sector: 'Volatility' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', shares: 7.5, costBasis: 190.72, currentPrice: 195, sector: 'Small Cap Equity' },
]

const realTransactions = [
  { date: '2024-08-15', symbol: 'IVV', type: 'buy', shares: 1, price: 476.29, fees: 1.99 },
  { date: '2024-08-12', symbol: 'QQQ', type: 'buy', shares: 2, price: 408.35, fees: 1.99 },
  { date: '2024-08-10', symbol: 'IVV', type: 'buy', shares: 2, price: 477.58, fees: 1.99 },
  { date: '2024-08-08', symbol: 'XOP', type: 'buy', shares: 1, price: 133.94, fees: 1.99 },
  { date: '2024-08-05', symbol: 'IWM', type: 'buy', shares: 0.5, price: 190.72, fees: 1.99 },
  { date: '2024-08-03', symbol: 'QQQ', type: 'buy', shares: 0.5, price: 351.68, fees: 1.99 },
  { date: '2024-08-01', symbol: 'IVV', type: 'buy', shares: 1, price: 421.12, fees: 1.99 },
]

const generatePerformanceData = () => {
  const now = new Date()
  
  return {
    '1D': Array.from({ length: 8 }, (_, i) => {
      const time = new Date(now)
      time.setHours(9, 30 + i * 30, 0, 0)
      return {
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        value: 125000 + Math.random() * 2000 + i * 200,
        sp500: 124800 + Math.random() * 1500 + i * 180,
        nasdaq: 124600 + Math.random() * 1800 + i * 190,
      }
    }),
    '1W': Array.from({ length: 5 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (4 - i))
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 125000 + Math.random() * 3000 + i * 400,
        sp500: 124500 + Math.random() * 2500 + i * 350,
        nasdaq: 124300 + Math.random() * 2800 + i * 380,
      }
    }),
    '1M': Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (29 - i))
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 120000 + Math.random() * 10000 + i * 200,
        sp500: 119000 + Math.random() * 8000 + i * 180,
        nasdaq: 118500 + Math.random() * 9000 + i * 190,
      }
    }),
    '6M': Array.from({ length: 26 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (25 - i) * 7)
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 100000 + Math.random() * 15000 + i * 1000,
        sp500: 98000 + Math.random() * 12000 + i * 900,
        nasdaq: 97500 + Math.random() * 13000 + i * 950,
      }
    }),
    'YTD': (() => {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      const dataPoints = Math.min(Math.max(daysSinceStart, 30), 365)
      const interval = Math.max(1, Math.floor(daysSinceStart / 50))
      
      return Array.from({ length: Math.floor(dataPoints / interval) }, (_, i) => {
        const date = new Date(startOfYear)
        date.setDate(date.getDate() + i * interval)
        return {
          time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 90000 + Math.random() * 20000 + i * 800,
          sp500: 88000 + Math.random() * 18000 + i * 750,
          nasdaq: 87000 + Math.random() * 19000 + i * 780,
        }
      })
    })(),
    '1Y': Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now)
      date.setMonth(date.getMonth() - (11 - i))
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: 80000 + Math.random() * 20000 + i * 3500,
        sp500: 78000 + Math.random() * 18000 + i * 3200,
        nasdaq: 77000 + Math.random() * 19000 + i * 3350,
      }
    }),
    '5Y': Array.from({ length: 60 }, (_, i) => {
      const date = new Date(now)
      date.setMonth(date.getMonth() - (59 - i))
      return {
        time: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: 50000 + Math.random() * 30000 + i * 1200,
        sp500: 48000 + Math.random() * 25000 + i * 1100,
        nasdaq: 47000 + Math.random() * 27000 + i * 1150,
      }
    }),
  }
}

const performanceData = generatePerformanceData()

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState('1M')
  const [portfolioData, setPortfolioData] = useState(realHoldings)
  const [transactions, setTransactions] = useState(realTransactions)

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolioData')
    const savedTransactions = localStorage.getItem('transactions')
    
    if (savedPortfolio) {
      setPortfolioData(JSON.parse(savedPortfolio))
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData))
  }, [portfolioData])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  const totalValue = portfolioData.reduce((sum, holding) => sum + (holding.shares * holding.currentPrice), 0)
  const totalCost = portfolioData.reduce((sum, holding) => sum + (holding.shares * holding.costBasis), 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = ((totalGainLoss / totalCost) * 100)

  const sectorAllocation = portfolioData.reduce((acc, holding) => {
    const value = holding.shares * holding.currentPrice
    acc[holding.sector] = (acc[holding.sector] || 0) + value
    return acc
  }, {} as Record<string, number>)

  const sectorData = Object.entries(sectorAllocation).map(([sector, value]) => ({
    name: sector,
    value: value,
    percentage: ((value / totalValue) * 100).toFixed(1)
  }))

  const dailyPL = 1250 + Math.random() * 500 - 250
  const dailyPLPercent = (dailyPL / totalValue) * 100

  const currentData = performanceData[selectedPeriod as keyof typeof performanceData]
  const startValue = currentData[0]?.value || 0
  const endValue = currentData[currentData.length - 1]?.value || 0
  const periodReturn = ((endValue - startValue) / startValue) * 100

  const portfolioReturns = currentData.map((point, index) => {
    if (index === 0) return 0
    return ((point.value - currentData[index - 1].value) / currentData[index - 1].value) * 100
  }).slice(1)

  const riskFreeRate = 2 // 2% annual risk-free rate
  const avgReturn = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length
  const returnVariance = portfolioReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / portfolioReturns.length
  const volatility = Math.sqrt(returnVariance)
  const annualizedReturn = avgReturn * (selectedPeriod === '1D' ? 252 : selectedPeriod === '1W' ? 52 : selectedPeriod === '1M' ? 12 : selectedPeriod === '6M' ? 2 : 1)
  const annualizedVolatility = volatility * Math.sqrt(selectedPeriod === '1D' ? 252 : selectedPeriod === '1W' ? 52 : selectedPeriod === '1M' ? 12 : selectedPeriod === '6M' ? 2 : 1)
  const sharpeRatio = annualizedVolatility > 0 ? (annualizedReturn - riskFreeRate) / annualizedVolatility : 0

  const sp500Start = currentData[0]?.sp500 || 0
  const sp500End = currentData[currentData.length - 1]?.sp500 || 0
  const sp500Return = ((sp500End - sp500Start) / sp500Start) * 100

  const nasdaqStart = currentData[0]?.nasdaq || 0
  const nasdaqEnd = currentData[currentData.length - 1]?.nasdaq || 0
  const nasdaqReturn = ((nasdaqEnd - nasdaqStart) / nasdaqStart) * 100

  const outperformanceVsSP500 = periodReturn - sp500Return
  const outperformanceVsNasdaq = periodReturn - nasdaqReturn


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sharpeful</h1>
            <p className="text-gray-600">Smart portfolio analytics and performance insights</p>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(totalValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +${Math.abs(totalGainLoss).toLocaleString()} ({totalGainLossPercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
              {dailyPL >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dailyPL >= 0 ? '+' : ''}${Math.round(dailyPL).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dailyPL >= 0 ? '+' : ''}{dailyPLPercent.toFixed(2)}% today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioData.length}</div>
              <p className="text-xs text-muted-foreground">
                {sectorData.length} sectors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${sharpeRatio >= 1 ? 'text-green-600' : sharpeRatio >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {sharpeRatio.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Risk-adjusted return
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Performance vs Benchmarks</CardTitle>
                <CardDescription>Portfolio value vs S&P 500 and NASDAQ 100 over time</CardDescription>
              </div>
              <div className="flex space-x-2">
                {Object.keys(performanceData).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="nasdaq" stroke="#FF8042" strokeWidth={2} name="NASDAQ 100" />
                  <Line type="monotone" dataKey="sp500" stroke="#8884d8" strokeWidth={2} name="S&P 500" />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} name="Portfolio" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${periodReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod} portfolio performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">vs S&P 500</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${outperformanceVsSP500 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {outperformanceVsSP500 >= 0 ? '+' : ''}{outperformanceVsSP500.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                S&P 500: {sp500Return >= 0 ? '+' : ''}{sp500Return.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">vs NASDAQ 100</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${outperformanceVsNasdaq >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {outperformanceVsNasdaq >= 0 ? '+' : ''}{outperformanceVsNasdaq.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                NASDAQ: {nasdaqReturn >= 0 ? '+' : ''}{nasdaqReturn.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volatility</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {annualizedVolatility.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Annualized volatility
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
                <CardDescription>Your investment positions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Market Value</TableHead>
                      <TableHead>Gain/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioData.map((holding) => {
                      const marketValue = holding.shares * holding.currentPrice
                      const costValue = holding.shares * holding.costBasis
                      const gainLoss = marketValue - costValue
                      const gainLossPercent = ((gainLoss / costValue) * 100)
                      
                      return (
                        <TableRow key={holding.symbol}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-gray-500">{holding.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>{holding.shares}</TableCell>
                          <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
                          <TableCell>${Math.round(marketValue).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className={gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {gainLoss >= 0 ? '+' : ''}${Math.round(gainLoss).toLocaleString()}
                              <div className="text-xs">
                                ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sector Allocation */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Portfolio distribution by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }: any) => `${name} ${percentage}%`}
                      >
                        {sectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {sectorData.map((sector, index) => (
                    <div key={sector.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{sector.name}</span>
                      </div>
                      <span className="text-sm font-medium">{sector.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest portfolio activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'}>
                        {transaction.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.shares}</TableCell>
                    <TableCell>${transaction.price.toFixed(2)}</TableCell>
                    <TableCell>${Math.round(transaction.shares * transaction.price).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
