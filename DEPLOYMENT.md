Production deployment

Environment
- Host: devinapps.com
- Production URL: https://user-login-app-r8dksrgd.devinapps.com
- Domain behavior: devinapps uses auto-generated subdomains; custom subdomain names are not supported.

Auth and data
- Client-side auth persisted via localStorage
- Demo credentials:
  - Email: demo@sharpeful.com
  - Password: Demo123!

How to test
1) First-time visit:
   - Go to the production URL above
   - Click “Create one,” sign up with the demo credentials, complete the onboarding
   - You will land on the dashboard
2) Returning visits:
   - Use “Sign In” with the same credentials
   - Session persists via localStorage
3) Route behavior:
   - Unauthenticated -> redirected to /login
   - Authenticated but not onboarded -> redirected to /onboarding
   - Authenticated + onboarded -> /

Build and deploy steps
1) Install and build:
   - npm ci
   - npm run lint
   - npm run build (outputs to dist/)
2) Deploy:
   - Use the deployment tool to publish the dist/ folder to devinapps.com

Upgrade paths
- Custom domain (e.g., app.sharpeful.com) can be set up on Vercel/Netlify with DNS control
- Real auth provider integration (Firebase, Supabase, or Auth0) can replace localStorage auth with minimal changes focused in src/context/AuthContext.tsx

Links
- Repo: https://github.com/descobarg98/portfolio_analytics
- PR (merged): https://github.com/descobarg98/portfolio_analytics/pull/3
