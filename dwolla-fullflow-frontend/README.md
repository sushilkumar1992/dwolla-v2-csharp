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

- Create personal or business customers
- Link bank funding sources and view the list of sources for a given customer
- Initiate transfers between any two funding sources

## Build

Use `npm run build` to generate a production bundle in `dist/`.
