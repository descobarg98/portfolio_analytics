export type Profile = {
  name: string
  email: string
  avatarUrl?: string
  riskTolerance?: 'Low' | 'Medium' | 'High'
  baseCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
  timeZone?: string

  onboarded?: boolean

  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced'
  goals?: Array<'Grow wealth' | 'Income' | 'Preserve capital' | 'Speculative' | 'Learn'>
  timeHorizon?: '<1y' | '1–3y' | '3–5y' | '5–10y' | '10+'
  riskScore?: 1 | 2 | 3 | 4 | 5

  incomeRange?: '<$50k' | '$50k–$100k' | '$100k–$250k' | '$250k–$1M' | '$1M+'
  netWorthRange?: '<$100k' | '$100k–$500k' | '$500k–$1M' | '$1M–$5M' | '$5M+'
  liquidityNeeds?: 'Low' | 'Moderate' | 'High'
  knowledge?: 'Novice' | 'Intermediate' | 'Expert'
}

export type User = {
  id: string
  email: string
  profile: Profile
}

export type AuthState = {
  user: User | null
  token?: string
}
