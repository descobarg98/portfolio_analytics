type Sector =
  | 'Technology'
  | 'Financial'
  | 'Healthcare'
  | 'Consumer'
  | 'Industrials'
  | 'Energy'
  | 'Real Estate'
  | 'Utilities'
  | 'Materials'
  | 'Communication'
  | 'ETF'
  | 'Other'

export type Instrument = {
  symbol: string
  name: string
  sector: Sector
}

export type PortfolioTransaction = {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price?: number
  datetime: string
  date: string
}

export type PortfolioHolding = {
  symbol: string
  name: string
  sector: Sector
  shares: number
  costBasis: number
}

const LARGE_CAP_UNIVERSE: Instrument[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', sector: 'Communication' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Class B', sector: 'Financial' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Co.', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'BA', name: 'Boeing Co.', sector: 'Industrials' },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials' },
  { symbol: 'MMM', name: '3M Co.', sector: 'Industrials' },
  { symbol: 'NEE', name: 'NextEra Energy', sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy', sector: 'Utilities' },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate' },
  { symbol: 'AMT', name: 'American Tower', sector: 'Real Estate' },
  { symbol: 'LIN', name: 'Linde plc', sector: 'Materials' },
  { symbol: 'NEM', name: 'Newmont Corp.', sector: 'Materials' },
]

const ETF_UNIVERSE: Instrument[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', sector: 'ETF' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF', sector: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', sector: 'ETF' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', sector: 'ETF' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', sector: 'ETF' },
  { symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate Bond ETF', sector: 'ETF' },
  { symbol: 'XOP', name: 'SPDR S&P Oil & Gas Exploration ETF', sector: 'ETF' },
  { symbol: 'UGA', name: 'United States Gasoline Fund', sector: 'ETF' },
  { symbol: 'IBIT', name: 'iShares Bitcoin Trust', sector: 'ETF' },
  { symbol: 'VIXY', name: 'ProShares VIX Short-Term Futures ETF', sector: 'ETF' },
  { symbol: 'DEM', name: 'WisdomTree Emerging Markets High Dividend Fund', sector: 'ETF' },
  { symbol: 'IAU', name: 'iShares Gold Trust', sector: 'ETF' },
  { symbol: 'SLV', name: 'iShares Silver Trust', sector: 'ETF' },
]

const PORTFOLIO_1_SYMBOLS = [...LARGE_CAP_UNIVERSE, ...ETF_UNIVERSE]
const PORTFOLIO_2_SYMBOLS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', sector: 'ETF' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF', sector: 'ETF' },
  { symbol: 'MSCI', name: 'MSCI Inc.', sector: 'Financial' },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
]

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000
    return state / 0x100000000
  }
}

const randomBetween = (rand: () => number, min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const generateTransactions = (
  instruments: Instrument[],
  count: number,
  seed: number,
  startDate: string,
  endDate: string,
) => {
  const rand = createSeededRandom(seed)
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const holdings = new Map<string, number>()
  const transactions: PortfolioTransaction[] = []

  for (let i = 0; i < count; i += 1) {
    const instrument = instruments[randomBetween(rand, 0, instruments.length - 1)]
    const time = new Date(start + rand() * (end - start))
    time.setHours(randomBetween(rand, 9, 15), randomBetween(rand, 0, 59), randomBetween(rand, 0, 59), 0)

    const currentHolding = holdings.get(instrument.symbol) || 0
    const shouldSell = rand() < 0.35 && currentHolding > 0
    const type: 'buy' | 'sell' = shouldSell ? 'sell' : 'buy'

    const quantityMax = instrument.sector === 'ETF' ? 40 : 120
    const quantity = randomBetween(rand, 1, quantityMax)

    const nextHolding = type === 'buy' ? currentHolding + quantity : Math.max(0, currentHolding - quantity)
    holdings.set(instrument.symbol, nextHolding)

    const datetime = time.toISOString()
    transactions.push({
      id: `${instrument.symbol}-${seed}-${i}`,
      symbol: instrument.symbol,
      type,
      quantity,
      datetime,
      date: toIsoDate(time),
    })
  }

  return transactions.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
}

export const PORTFOLIO_OPTIONS = [
  { id: 'portfolio-4', name: "Fidelity Investments - Daniel's Roth IRA" },
  { id: 'portfolio-1', name: 'Investment Portfolio 1' },
  { id: 'portfolio-2', name: 'Investment Portfolio 2' },
  { id: 'portfolio-3', name: 'Verification Portfolio QQQ' },
] as const

export type PortfolioId = (typeof PORTFOLIO_OPTIONS)[number]['id']

const ALL_INSTRUMENTS: Instrument[] = [
  ...LARGE_CAP_UNIVERSE,
  ...ETF_UNIVERSE,
]

const instrumentMap = new Map(ALL_INSTRUMENTS.map((instrument) => [instrument.symbol, instrument]))

const resolveInstruments = (symbols: string[]): Instrument[] =>
  symbols.map((symbol) => instrumentMap.get(symbol) || ({ symbol, name: symbol, sector: 'Other' as const }))

const ROTH_IRA_SYMBOLS = ['IVV', 'QQQ', 'HYG', 'KRE', 'VIXY', 'XOP', 'SHY', 'IWM', 'UGA', 'IBIT', 'VUG', 'DEM', 'IAU', 'SLV']

const ROTH_IRA_TRANSACTIONS: PortfolioTransaction[] = [
  {
    id: 'roth-1',
    symbol: 'IVV',
    type: 'buy',
    quantity: 3,
    datetime: '2023-01-25T13:07:00.000Z',
    date: '2023-01-25',
  },
  {
    id: 'roth-2',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 2,
    datetime: '2023-01-25T13:07:00.000Z',
    date: '2023-01-25',
  },
  {
    id: 'roth-3',
    symbol: 'HYG',
    type: 'buy',
    quantity: 1,
    datetime: '2023-02-08T13:07:00.000Z',
    date: '2023-02-08',
  },
  {
    id: 'roth-4',
    symbol: 'IVV',
    type: 'buy',
    quantity: 1,
    datetime: '2023-02-08T13:07:00.000Z',
    date: '2023-02-08',
  },
  {
    id: 'roth-5',
    symbol: 'HYG',
    type: 'sell',
    quantity: 1,
    datetime: '2023-02-28T13:07:00.000Z',
    date: '2023-02-28',
  },
  {
    id: 'roth-6',
    symbol: 'IVV',
    type: 'buy',
    quantity: 3,
    datetime: '2023-02-28T13:07:00.000Z',
    date: '2023-02-28',
  },
  {
    id: 'roth-7',
    symbol: 'KRE',
    type: 'buy',
    quantity: 5,
    datetime: '2023-03-13T13:07:00.000Z',
    date: '2023-03-13',
  },
  {
    id: 'roth-8',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 1,
    datetime: '2023-03-14T13:07:00.000Z',
    date: '2023-03-14',
  },
  {
    id: 'roth-9',
    symbol: 'XOP',
    type: 'buy',
    quantity: 1,
    datetime: '2023-03-14T13:07:00.000Z',
    date: '2023-03-14',
  },
  {
    id: 'roth-10',
    symbol: 'HYG',
    type: 'buy',
    quantity: 4,
    datetime: '2023-03-15T13:07:00.000Z',
    date: '2023-03-15',
  },
  {
    id: 'roth-11',
    symbol: 'IVV',
    type: 'buy',
    quantity: 0.5,
    datetime: '2023-03-15T13:07:00.000Z',
    date: '2023-03-15',
  },
  {
    id: 'roth-12',
    symbol: 'SHY',
    type: 'buy',
    quantity: 2,
    datetime: '2023-03-15T13:07:00.000Z',
    date: '2023-03-15',
  },
  {
    id: 'roth-13',
    symbol: 'XOP',
    type: 'buy',
    quantity: 1,
    datetime: '2023-03-16T13:07:00.000Z',
    date: '2023-03-16',
  },
  {
    id: 'roth-14',
    symbol: 'XOP',
    type: 'buy',
    quantity: 2,
    datetime: '2023-04-12T13:07:00.000Z',
    date: '2023-04-12',
  },
  {
    id: 'roth-15',
    symbol: 'IVV',
    type: 'sell',
    quantity: 0.5,
    datetime: '2023-05-22T13:07:00.000Z',
    date: '2023-05-22',
  },
  {
    id: 'roth-16',
    symbol: 'IVV',
    type: 'sell',
    quantity: 3,
    datetime: '2023-05-22T13:07:00.000Z',
    date: '2023-05-22',
  },
  {
    id: 'roth-17',
    symbol: 'IVV',
    type: 'sell',
    quantity: 4,
    datetime: '2023-05-22T13:07:00.000Z',
    date: '2023-05-22',
  },
  {
    id: 'roth-18',
    symbol: 'QQQ',
    type: 'sell',
    quantity: 2,
    datetime: '2023-05-22T13:07:00.000Z',
    date: '2023-05-22',
  },
  {
    id: 'roth-19',
    symbol: 'IVV',
    type: 'buy',
    quantity: 1,
    datetime: '2023-07-19T13:07:00.000Z',
    date: '2023-07-19',
  },
  {
    id: 'roth-20',
    symbol: 'IWM',
    type: 'buy',
    quantity: 5,
    datetime: '2023-07-19T13:07:00.000Z',
    date: '2023-07-19',
  },
  {
    id: 'roth-21',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.5,
    datetime: '2023-07-19T13:07:00.000Z',
    date: '2023-07-19',
  },
  {
    id: 'roth-22',
    symbol: 'IVV',
    type: 'buy',
    quantity: 1,
    datetime: '2023-11-01T13:07:00.000Z',
    date: '2023-11-01',
  },
  {
    id: 'roth-23',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.5,
    datetime: '2023-11-01T13:07:00.000Z',
    date: '2023-11-01',
  },
  {
    id: 'roth-24',
    symbol: 'XOP',
    type: 'buy',
    quantity: 1,
    datetime: '2023-11-01T13:07:00.000Z',
    date: '2023-11-01',
  },
  {
    id: 'roth-25',
    symbol: 'SHY',
    type: 'sell',
    quantity: 2,
    datetime: '2024-01-08T13:07:00.000Z',
    date: '2024-01-08',
  },
  {
    id: 'roth-26',
    symbol: 'IVV',
    type: 'buy',
    quantity: 2,
    datetime: '2024-01-16T13:07:00.000Z',
    date: '2024-01-16',
  },
  {
    id: 'roth-27',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 2,
    datetime: '2024-01-16T13:07:00.000Z',
    date: '2024-01-16',
  },
  {
    id: 'roth-28',
    symbol: 'IVV',
    type: 'buy',
    quantity: 1,
    datetime: '2024-01-18T13:07:00.000Z',
    date: '2024-01-18',
  },
  {
    id: 'roth-29',
    symbol: 'IWM',
    type: 'buy',
    quantity: 0.5,
    datetime: '2024-01-18T13:07:00.000Z',
    date: '2024-01-18',
  },
  {
    id: 'roth-30',
    symbol: 'IWM',
    type: 'buy',
    quantity: 2,
    datetime: '2024-01-18T13:07:00.000Z',
    date: '2024-01-18',
  },
  {
    id: 'roth-31',
    symbol: 'IVV',
    type: 'buy',
    quantity: 1,
    datetime: '2024-02-13T13:07:00.000Z',
    date: '2024-02-13',
  },
  {
    id: 'roth-32',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.75,
    datetime: '2024-02-13T13:07:00.000Z',
    date: '2024-02-13',
  },
  {
    id: 'roth-33',
    symbol: 'XOP',
    type: 'buy',
    quantity: 1,
    datetime: '2024-02-13T13:07:00.000Z',
    date: '2024-02-13',
  },
  {
    id: 'roth-34',
    symbol: 'IWM',
    type: 'sell',
    quantity: 0.5,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-35',
    symbol: 'IWM',
    type: 'sell',
    quantity: 1,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-36',
    symbol: 'IWM',
    type: 'sell',
    quantity: 6,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-37',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.25,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-38',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.5,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-39',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 2,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-40',
    symbol: 'UGA',
    type: 'buy',
    quantity: 10,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-41',
    symbol: 'XOP',
    type: 'buy',
    quantity: 2,
    datetime: '2024-04-01T13:07:00.000Z',
    date: '2024-04-01',
  },
  {
    id: 'roth-42',
    symbol: 'UGA',
    type: 'buy',
    quantity: 0.5,
    datetime: '2024-08-26T13:07:00.000Z',
    date: '2024-08-26',
  },
  {
    id: 'roth-43',
    symbol: 'HYG',
    type: 'sell',
    quantity: 4,
    datetime: '2024-12-04T13:07:00.000Z',
    date: '2024-12-04',
  },
  {
    id: 'roth-44',
    symbol: 'HYG',
    type: 'buy',
    quantity: 10,
    datetime: '2025-02-10T13:07:00.000Z',
    date: '2025-02-10',
  },
  {
    id: 'roth-45',
    symbol: 'IBIT',
    type: 'buy',
    quantity: 5,
    datetime: '2025-02-10T13:07:00.000Z',
    date: '2025-02-10',
  },
  {
    id: 'roth-46',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 1,
    datetime: '2025-02-10T13:07:00.000Z',
    date: '2025-02-10',
  },
  {
    id: 'roth-47',
    symbol: 'XOP',
    type: 'buy',
    quantity: 1,
    datetime: '2025-02-10T13:07:00.000Z',
    date: '2025-02-10',
  },
  {
    id: 'roth-48',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 1,
    datetime: '2025-02-24T13:07:00.000Z',
    date: '2025-02-24',
  },
  {
    id: 'roth-49',
    symbol: 'IVV',
    type: 'buy',
    quantity: 4,
    datetime: '2025-03-13T13:07:00.000Z',
    date: '2025-03-13',
  },
  {
    id: 'roth-50',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 0.5,
    datetime: '2025-03-13T13:07:00.000Z',
    date: '2025-03-13',
  },
  {
    id: 'roth-51',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 1,
    datetime: '2025-03-13T13:07:00.000Z',
    date: '2025-03-13',
  },
  {
    id: 'roth-52',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 9,
    datetime: '2025-03-13T13:07:00.000Z',
    date: '2025-03-13',
  },
  {
    id: 'roth-53',
    symbol: 'VIXY',
    type: 'sell',
    quantity: 9,
    datetime: '2025-04-03T13:07:00.000Z',
    date: '2025-04-03',
  },
  {
    id: 'roth-54',
    symbol: 'HYG',
    type: 'sell',
    quantity: 10,
    datetime: '2025-04-07T13:07:00.000Z',
    date: '2025-04-07',
  },
  {
    id: 'roth-55',
    symbol: 'VIXY',
    type: 'sell',
    quantity: 1,
    datetime: '2025-04-07T13:07:00.000Z',
    date: '2025-04-07',
  },
  {
    id: 'roth-56',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 10,
    datetime: '2025-05-15T13:07:00.000Z',
    date: '2025-05-15',
  },
  {
    id: 'roth-57',
    symbol: 'VIXY',
    type: 'sell',
    quantity: 10,
    datetime: '2025-05-23T13:07:00.000Z',
    date: '2025-05-23',
  },
  {
    id: 'roth-58',
    symbol: 'QQQ',
    type: 'sell',
    quantity: 5,
    datetime: '2025-06-27T13:07:00.000Z',
    date: '2025-06-27',
  },
  {
    id: 'roth-59',
    symbol: 'IVV',
    type: 'buy',
    quantity: 4,
    datetime: '2025-07-07T13:07:00.000Z',
    date: '2025-07-07',
  },
  {
    id: 'roth-60',
    symbol: 'VUG',
    type: 'buy',
    quantity: 1,
    datetime: '2025-07-16T13:07:00.000Z',
    date: '2025-07-16',
  },
  {
    id: 'roth-61',
    symbol: 'IBIT',
    type: 'buy',
    quantity: 1,
    datetime: '2025-07-21T13:07:00.000Z',
    date: '2025-07-21',
  },
  {
    id: 'roth-62',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 20,
    datetime: '2025-07-21T13:07:00.000Z',
    date: '2025-07-21',
  },
  {
    id: 'roth-63',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 20,
    datetime: '2025-07-23T13:07:00.000Z',
    date: '2025-07-23',
  },
  {
    id: 'roth-64',
    symbol: 'QQQ',
    type: 'buy',
    quantity: 2,
    datetime: '2025-08-01T13:07:00.000Z',
    date: '2025-08-01',
  },
  {
    id: 'roth-65',
    symbol: 'VIXY',
    type: 'sell',
    quantity: 40,
    datetime: '2025-08-01T13:07:00.000Z',
    date: '2025-08-01',
  },
  {
    id: 'roth-66',
    symbol: 'VIXY',
    type: 'buy',
    quantity: 20,
    datetime: '2025-09-10T13:07:00.000Z',
    date: '2025-09-10',
  },
  {
    id: 'roth-67',
    symbol: 'DEM',
    type: 'buy',
    quantity: 10,
    datetime: '2026-01-30T13:07:00.000Z',
    date: '2026-01-30',
  },
  {
    id: 'roth-68',
    symbol: 'IAU',
    type: 'buy',
    quantity: 10,
    datetime: '2026-01-30T13:07:00.000Z',
    date: '2026-01-30',
  },
  {
    id: 'roth-69',
    symbol: 'SLV',
    type: 'buy',
    quantity: 5,
    datetime: '2026-01-30T13:07:00.000Z',
    date: '2026-01-30',
  },
  {
    id: 'roth-70',
    symbol: 'SLV',
    type: 'buy',
    quantity: 10,
    datetime: '2026-01-30T13:07:00.000Z',
    date: '2026-01-30',
  },
  {
    id: 'roth-71',
    symbol: 'SLV',
    type: 'buy',
    quantity: 10,
    datetime: '2026-01-30T13:07:00.000Z',
    date: '2026-01-30',
  },
]

export const getPortfolioInstruments = (portfolioId: PortfolioId) => {
  if (portfolioId === 'portfolio-1') return PORTFOLIO_1_SYMBOLS
  if (portfolioId === 'portfolio-2') return PORTFOLIO_2_SYMBOLS
  if (portfolioId === 'portfolio-4') return resolveInstruments(ROTH_IRA_SYMBOLS)
  return [{ symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF' }]
}

export const getPortfolioTransactions = (portfolioId: PortfolioId): PortfolioTransaction[] => {
  if (portfolioId === 'portfolio-1') {
    return generateTransactions(
      PORTFOLIO_1_SYMBOLS,
      500,
      2023,
      '2023-01-01T00:00:00.000Z',
      '2025-12-31T23:59:59.000Z',
    )
  }
  if (portfolioId === 'portfolio-2') {
    return generateTransactions(
      PORTFOLIO_2_SYMBOLS,
      50,
      2024,
      '2023-06-01T00:00:00.000Z',
      '2025-12-31T23:59:59.000Z',
    )
  }
  if (portfolioId === 'portfolio-4') {
    return ROTH_IRA_TRANSACTIONS
  }
  return [
    {
      id: 'QQQ-portfolio-3-1',
      symbol: 'QQQ',
      type: 'buy',
      quantity: 10,
      datetime: '2025-02-12T15:30:00.000Z',
      date: '2025-02-12',
    },
  ]
}

export const buildHoldingsFromTransactions = (
  transactions: PortfolioTransaction[],
  instruments: Instrument[],
) => {
  const map = new Map(instruments.map((instrument) => [instrument.symbol, instrument]))
  const holdings = new Map<string, { shares: number; cost: number }>()

  for (const txn of transactions) {
    const entry = holdings.get(txn.symbol) || { shares: 0, cost: 0 }
    const price = txn.price ?? 0
    if (txn.type === 'buy') {
      entry.cost += txn.quantity * price
      entry.shares += txn.quantity
    } else if (entry.shares > 0) {
      const averageCost = entry.cost / entry.shares
      const sellShares = Math.min(entry.shares, txn.quantity)
      entry.cost -= averageCost * sellShares
      entry.shares -= sellShares
    }
    holdings.set(txn.symbol, entry)
  }

  return Array.from(holdings.entries())
    .filter(([, entry]) => entry.shares > 0)
    .map(([symbol, entry]) => {
      const instrument = map.get(symbol)
      return {
        symbol,
        name: instrument?.name || symbol,
        sector: instrument?.sector || 'Other',
        shares: Number(entry.shares.toFixed(2)),
        costBasis: entry.shares > 0 ? Number((entry.cost / entry.shares).toFixed(2)) : 0,
      }
    })
}
