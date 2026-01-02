# Dwolla Full Flow Frontend

React (Vite) single-page experience for driving the Dwolla end-to-end API. It pairs with the `FullFlow.Api` backend to create customers, link funding sources, and trigger transfers.

## Setup

1. Install dependencies (requires Node 18+):
   ```bash
   npm install
   ```
2. Set the backend base URL (defaults to `http://localhost:5000`):
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Features

- Create personal or business customers and update existing profiles
- Suspend, deactivate, reactivate, or upgrade customers plus generate IAV tokens for instant bank linking
- Link bank funding sources and view the list of sources for a given customer
- Check individual funding source balances
- Trigger Dwolla micro-deposits and submit verification amounts for a funding source
- Upload customer verification documents and review their processing status
- Initiate transfers between any two funding sources
- Reuse loaded funding sources when composing transfers and look up transfer status by ID
- Cancel transfers when still eligible and confirm the resulting status
- Submit transfer refunds with optional idempotency keys and review return records for failed transfers
- Initiate mass payments across multiple destinations and inspect per-item delivery status
- Query Dwolla events directly (filterable by resource and topic) alongside local webhook logs
- Create, list, and delete webhook subscriptions to pair with the webhook receiver
- View validated webhook events posted to the backend webhook receiver with replay protection and persistence
- Create, list, attach, and certify business beneficial owners with detail lookups

## Build

Use `npm run build` to generate a production bundle in `dist/`.
