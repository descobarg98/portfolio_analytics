# Massive API (browser setup)

This project calls Massive from a local Express server to fetch live prices.

## What you need
- A Massive API key
- The Massive API base URL and endpoints

## Create a local server config
Create a file at `server/.env.local` with:

```env
MASSIVE_API_KEY=your_massive_api_key
MASSIVE_API_BASE_URL=https://api.massive.com/v2
MASSIVE_SERVER_PORT=8000
APP_ORIGIN=http://localhost:5173
```

Notes:
- The app uses the aggs endpoint pattern you provided.
- The key stays on the server, not in the browser.

## How it is used
- Latest prices are fetched for all portfolio symbols.
- Historical prices are fetched for the last 1 year to compute returns and the Sharpe ratio.

If you see a pricing error in the dashboard, the endpoints or key are likely incorrect.
