import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LS_AUTH_KEY, LS_PROFILE_KEY } from '@/constants/auth'
import type { AuthState, Profile, User } from '@/types/auth'

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (partial: Partial<Profile>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_AUTH_KEY)
      if (raw) {
        const parsed: AuthState = JSON.parse(raw)
        setState(parsed)
      }
    } catch { void 0 }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(state))
      if (state.user?.profile) {
        localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(state.user.profile))
      }
    } catch { void 0 }
  }, [state])

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Invalid credentials')
    const existingProfileRaw = localStorage.getItem(LS_PROFILE_KEY)
    let profile: Profile | null = null
    if (existingProfileRaw) {
      try {
        profile = JSON.parse(existingProfileRaw)
      } catch { void 0 }
    }
    const user: User = {
      id: crypto.randomUUID(),
      email,
      profile: profile ?? { name: email.split('@')[0] ?? 'User', email },
    }
    setState({ user })
  }

  const signup = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error('Invalid input')
    const user: User = {
      id: crypto.randomUUID(),
      email,
      profile: { name, email },
    }
    setState({ user })
  }

  const logout = () => {
    setState({ user: null })
  }

  const updateProfile = (partial: Partial<Profile>) => {
    setState((prev) => {
      const user = prev.user
      if (!user) return prev
      const updated: User = { ...user, profile: { ...user.profile, ...partial } }
      return { ...prev, user: updated }
    })
  }

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    login,
    signup,
    logout,
    updateProfile,
  }), [state.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
