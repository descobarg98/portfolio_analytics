# Plaid setup (no coding)

This app currently uses fake data in the browser. Plaid is a service that pulls real bank and investment data, but it requires a small server because your Plaid secret must never live in the browser.

## What you need to do first
1) Create a Plaid account
   - Go to https://plaid.com and create an account.

2) Create a Plaid application
   - In the Plaid Dashboard, create a new app.
   - Choose **Sandbox** for testing (free test data).

3) Copy your Plaid keys
   - Find and copy these values:
     - Client ID
     - Secret (Sandbox)

4) Decide where your server will run
   - This can be the same machine for local testing.
   - Later, you can deploy it to a host like Vercel, Render, or Railway.

Keep these values private. Do not put your Plaid Secret into any browser code.
