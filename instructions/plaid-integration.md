# Replace dummy data with Plaid (simple plan)

This app is a browser app only. Plaid requires a secure server. The high-level plan is:

1) Add a small server to talk to Plaid.
2) The browser asks your server for data.
3) The server asks Plaid, then sends back safe data for the UI.

Below is the step-by-step plan in plain language.

## Step 1: Add a small server (required)
Plaid requires a secret key. Secrets cannot go in the browser.

We will add a small server with these endpoints:
- **/plaid/create_link_token**: gives the browser a short-lived token to open Plaid Link.
- **/plaid/exchange_public_token**: trades a temporary token for an access token (server only).
- **/plaid/holdings** (and later **/plaid/transactions**): returns real data to the browser.

## Step 2: Add Plaid Link to the app
Plaid Link is the popup that lets you choose a bank or brokerage.
- The browser asks the server for a link token.
- Plaid Link opens.
- After you finish, Plaid gives a short-lived token.
- The browser sends that token to the server.
- The server saves the real access token.

## Step 3: Replace the fake data in the dashboard
Right now the dashboard uses hard-coded data. We will:
- Call the server for holdings and transactions.
- Map the response into the same shape used by the UI.
- Render real data.

## Step 4: Start in Plaid Sandbox
Plaid Sandbox uses fake institutions and fake data so you can test safely.
- You can connect to the "First Platypus Bank" demo institution.
- This gives predictable test data.

## Step 5: Later (production)
When you are ready to go live:
- Switch Plaid from Sandbox to Production.
- Update Plaid keys.
- Update redirect URLs in Plaid.

## What I need from you to proceed
When you are ready, tell me:
1) Where you want the server (same repo is fine).
2) Whether you want a simple local-only demo or a deployable server.

Then I can build the server and wire the UI.
