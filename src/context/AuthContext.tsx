import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { Profile, User } from '@/types/auth'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: () => void
  signup: () => void
  logout: () => void
  updateProfile: (partial: Partial<Profile>) => Promise<void>
  completeOnboarding: (data: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0()
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently()
          
          const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${auth0User.sub}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          
          let userMetadata: any = {}
          if (response.ok) {
            const userData = await response.json()
            userMetadata = userData.user_metadata || {}
          }

          const profile: Profile = {
            name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            email: auth0User.email || '',
            avatarUrl: auth0User.picture,
            onboarded: userMetadata.onboarded || false,
            ...userMetadata
          }

          const mappedUser: User = {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            profile
          }

          setUser(mappedUser)
        } catch (error) {
          console.error('Error loading user profile:', error)
          const profile: Profile = {
            name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            email: auth0User.email || '',
            avatarUrl: auth0User.picture,
            onboarded: false
          }

          const mappedUser: User = {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            profile
          }

          setUser(mappedUser)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    if (!auth0Loading) {
      loadUserProfile()
    }
  }, [isAuthenticated, auth0User, auth0Loading, getAccessTokenSilently])

  const login = () => {
    loginWithRedirect()
  }

  const signup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    })
  }

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    })
  }

  const updateUserMetadata = async (metadata: Record<string, any>) => {
    if (!auth0User?.sub) return

    try {
      const token = await getAccessTokenSilently()
      
      const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${auth0User.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_metadata: metadata
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update user metadata')
      }
    } catch (error) {
      console.error('Error updating user metadata:', error)
      throw error
    }
  }

  const updateProfile = async (partial: Partial<Profile>) => {
    if (!user) return

    const updatedProfile = { ...user.profile, ...partial }
    const updatedUser = { ...user, profile: updatedProfile }
    setUser(updatedUser)

    await updateUserMetadata(updatedProfile)
  }

  const completeOnboarding = async (data: Partial<Profile>) => {
    if (!user) return

    const updatedProfile = { ...user.profile, ...data, onboarded: true }
    const updatedUser = { ...user, profile: updatedProfile }
    setUser(updatedUser)

    await updateUserMetadata(updatedProfile)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading: auth0Loading || isLoading,
    login,
    signup,
    logout,
    updateProfile,
    completeOnboarding,
  }), [user, auth0Loading, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
