# Dwolla Full Flow API

This ASP.NET Core Web API exposes opinionated endpoints for running an end-to-end Dwolla flow using the local `Dwolla.Client` SDK. It supports creating customers, attaching bank funding sources, generating application tokens, and initiating transfers.

## Configuration

Set environment variables or configuration values for the Dwolla credentials before running:

- `Dwolla__Key` – Dwolla application key
- `Dwolla__Secret` – Dwolla application secret
- `Dwolla__IsSandbox` – `true` for sandbox (default), `false` for production
- `Dwolla__WebhookSecret` – shared secret used to validate Dwolla webhook signatures
- `Cors__AllowedOrigins` – optional list of origins allowed to call the API (defaults to Vite dev server URLs)
- `WebhookStore__MaxEvents` – maximum webhook events retained in the log (defaults to 500)
- `WebhookStore__FilePath` – file path for persisting webhook events across restarts

For local development you can also edit `appsettings.json` or provide a user secrets store. Keep secrets out of source control.

## Running the API

1. Restore and build the solution (requires .NET 8 SDK):
   ```bash
   dotnet restore DwollaFullFlow.Api.csproj
   dotnet run --project DwollaFullFlow.Api.csproj
   ```
2. The API defaults to `http://localhost:5000` and enables Swagger UI for quick testing.

## Key Endpoints

- `POST /api/auth/token` – obtain an application access token
- `POST /api/customers` – create a personal or business customer
- `GET /api/customers` – list customers (paged)
- `GET /api/customers/{customerId}` – fetch a single customer
- `PUT /api/customers/{customerId}` – update core customer profile details
- `POST /api/customers/{customerId}/suspend` – suspend a customer
- `POST /api/customers/{customerId}/deactivate` – deactivate a customer
- `POST /api/customers/{customerId}/reactivate` – reactivate a suspended/deactivated customer
- `POST /api/customers/{customerId}/upgrade` – request a receive-only customer upgrade
- `GET /api/customers/{customerId}/iav-token` – create an Instant Account Verification token for bank linking
- `GET /api/customers/{customerId}/documents` – list verification documents for a customer (paged)
- `POST /api/customers/{customerId}/documents` – upload a verification document for review
- `POST /api/customers/{customerId}/beneficial-owners` – create and attach a beneficial owner to a business customer
- `GET /api/customers/{customerId}/beneficial-owners` – list beneficial owners for a customer (paged)
- `POST /api/customers/{customerId}/beneficial-ownership/certify` – certify beneficial ownership status for a business
- `POST /api/customers/{customerId}/beneficial-owners/{beneficialOwnerId}` – attach an existing beneficial owner to a customer
- `GET /api/beneficial-owners/{beneficialOwnerId}` – retrieve a specific beneficial owner
- `POST /api/funding-sources/customers/{customerId}` – add a bank account for a customer
- `POST /api/funding-sources/plaid` – create a funding source from a Plaid processor token for a customer
- `GET /api/funding-sources/customers/{customerId}` – list funding sources for a customer
- `GET /api/funding-sources/{fundingSourceId}/balance` – fetch the current balance for a funding source
- `POST /api/funding-sources/{fundingSourceId}/micro-deposits/initiate` – trigger Dwolla micro-deposits to verify a funding source
- `POST /api/funding-sources/{fundingSourceId}/micro-deposits/verify` – submit the two micro-deposit amounts to complete verification
- `POST /api/transfers` – initiate a transfer between two funding sources
- `GET /api/transfers/{transferId}` – fetch transfer details and status by ID
- `POST /api/transfers/{transferId}/cancel` – cancel a transfer that is still cancelable
- `POST /api/transfers/{transferId}/refunds` – submit a refund for a completed transfer with optional idempotency key
- `GET /api/transfers/{transferId}/returns` – list return records for a transfer to understand failure reasons
- `POST /api/transfers/mass-payments` – create a mass payment with multiple destination items
- `GET /api/transfers/mass-payments/{massPaymentId}` – fetch mass payment status and totals
- `GET /api/transfers/mass-payments/{massPaymentId}/items` – page through mass payment items and delivery status
- `GET /api/events` – list Dwolla events with optional resource/topic filters
- `GET /api/events/{eventId}` – retrieve a single Dwolla event by ID
- `POST /api/webhooks` – Dwolla webhook receiver that validates request signatures and records events
- `GET /api/webhooks/events` – list recently received webhook events (optionally filtered by `resourceId`)
- `DELETE /api/webhooks/events` – clear the in-memory webhook event log
- `GET /api/webhooks/subscriptions` – list webhook subscriptions configured for the application
- `POST /api/webhooks/subscriptions` – create a webhook subscription for the provided URL and secret
- `DELETE /api/webhooks/subscriptions/{subscriptionId}` – delete a webhook subscription by ID
- `GET /api/directory/business-classifications` – list Dwolla business classifications and their industry codes
- `GET /api/exchanges/partners` – list enabled exchange partners (MX/Finicity) for aggregator flows
- `GET /api/exchanges` – page through created exchanges
- `GET /api/exchanges/{exchangeId}` – fetch a single exchange
- `POST /api/exchanges` – create an MX/Finicity exchange for a customer using a processor token
- `POST /api/labels` – create a label balance
- `GET /api/labels` – list labels
- `GET /api/labels/{labelId}` – fetch a single label
- `POST /api/labels/{labelId}/ledger-entries` – credit or debit a label directly
- `GET /api/labels/{labelId}/ledger-entries` – list ledger entries on a label
- `POST /api/labels/{labelId}/reallocations` – move balance between labels

### Webhooks

Provide `Dwolla__WebhookSecret` from your Dwolla application settings and configure Dwolla to send webhooks to
`/api/webhooks`. The API validates the Dwolla signature header, records accepted payloads in a durable, replay-protected
store, and exposes the recent event log through `GET /api/webhooks/events` for quick inspection while developing locally.
The webhook store persists to `WebhookStore__FilePath`, deduplicates events by Dwolla ID or payload hash to guard against
replays, and can be cleared through the API when needed. Use the webhook subscription endpoints to manage callback URLs and
secrets directly from this API when automating setup.
