export type Profile = {
  name: string
  email: string
  avatarUrl?: string
  riskTolerance?: 'Low' | 'Medium' | 'High'
  baseCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
  timeZone?: string
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
