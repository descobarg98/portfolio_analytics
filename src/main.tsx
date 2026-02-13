import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import AppRouter from './AppRouter.tsx'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin
const auth0Scope = 'openid profile email read:users update:users read:user_metadata update:user_metadata update:current_user_metadata'
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: redirectUri,
          audience: audience,
          scope: auth0Scope,
        }}
      >
        <AppRouter />
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>,
)
