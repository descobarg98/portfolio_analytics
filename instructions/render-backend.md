# Render backend setup (Massive proxy)

Use this when deploying the Express Massive proxy so the production site can fetch pricing data.

## 1) Create the Render service
- Create a new **Web Service** on Render.
- Connect this GitHub repo.
- Root directory: repo root.
- Runtime: Node.
- Build command: `npm install`
- Start command: `node server/index.js`

## 2) Add Render environment variables
- `MASSIVE_API_KEY`: your Massive API key.
- `APP_ORIGIN`: `https://www.sharpeful.com,http://localhost:5173`
- `MASSIVE_API_BASE_URL` (optional): defaults to `https://api.massive.com/v2`
- `MASSIVE_SERVER_PORT` (optional): leave blank; Render sets `PORT`.

## 3) Add GitHub Pages env var
After Render deploys, copy the Render service URL (example: `https://sharpeful-proxy.onrender.com`).

Add this as a **GitHub repo secret**:
- `VITE_API_BASE`: `https://your-render-service.onrender.com`

Then re-run the GitHub Pages workflow so the frontend is built with the new API base.

## 4) Quick sanity check
- Open `https://your-render-service.onrender.com/api/massive/latest?symbols=AAPL`
- You should see a JSON response with `results`.

If this works, reload `https://www.sharpeful.com` and pricing should populate.
