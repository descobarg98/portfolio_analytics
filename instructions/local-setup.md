# Local setup and testing

## Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node.js)
- An Auth0 account and SPA application

## Setup
1) Install dependencies:
   - npm ci

2) Create a `.env` file in the project root with your Auth0 values:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

3) In Auth0, make sure your app allows local URLs:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
   - Allowed Origins (CORS): `http://localhost:5173`

4) (Optional) Enable Auth0 Management API scopes so onboarding metadata saves:
   - `read:users`, `update:users`, `read:user_metadata`, `update:user_metadata`

## Run locally
- npm run dev
- Open `http://localhost:5173` in your browser

## Test flow
1) Visit `http://localhost:5173` and you should be redirected to `/login`.
2) Click "Sign In with Auth0" and complete the Auth0 login.
3) If the account is new, you should be sent to `/onboarding`.
4) Submit onboarding and you should land on the dashboard at `/`.
5) Use the avatar menu to open Profile and verify profile fields save.

## Quick checks
- Refresh the page and confirm you remain logged in.
- Log out and confirm you are redirected to `/login`.
