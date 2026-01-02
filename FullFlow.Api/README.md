# Dwolla Full Flow API

This ASP.NET Core Web API exposes opinionated endpoints for running an end-to-end Dwolla flow using the local `Dwolla.Client` SDK. It supports creating customers, attaching bank funding sources, generating application tokens, and initiating transfers.

## Configuration

Set environment variables or configuration values for the Dwolla credentials before running:

- `Dwolla__Key` – Dwolla application key
- `Dwolla__Secret` – Dwolla application secret
- `Dwolla__IsSandbox` – `true` for sandbox (default), `false` for production
- `Dwolla__WebhookSecret` – shared secret used to validate Dwolla webhook signatures
- `Cors__AllowedOrigins` – optional list of origins allowed to call the API (defaults to Vite dev server URLs)

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
- `GET /api/customers/{customerId}/documents` – list verification documents for a customer (paged)
- `POST /api/customers/{customerId}/documents` – upload a verification document for review
- `POST /api/funding-sources/customers/{customerId}` – add a bank account for a customer
- `GET /api/funding-sources/customers/{customerId}` – list funding sources for a customer
- `GET /api/funding-sources/{fundingSourceId}/balance` – fetch the current balance for a funding source
- `POST /api/funding-sources/{fundingSourceId}/micro-deposits/initiate` – trigger Dwolla micro-deposits to verify a funding source
- `POST /api/funding-sources/{fundingSourceId}/micro-deposits/verify` – submit the two micro-deposit amounts to complete verification
- `POST /api/transfers` – initiate a transfer between two funding sources
- `GET /api/transfers/{transferId}` – fetch transfer details and status by ID
- `POST /api/transfers/{transferId}/cancel` – cancel a transfer that is still cancelable
- `POST /api/webhooks` – Dwolla webhook receiver that validates request signatures and records events
- `GET /api/webhooks/events` – list recently received webhook events (optionally filtered by `resourceId`)
- `DELETE /api/webhooks/events` – clear the in-memory webhook event log
- `GET /api/webhooks/subscriptions` – list webhook subscriptions configured for the application
- `POST /api/webhooks/subscriptions` – create a webhook subscription for the provided URL and secret
- `DELETE /api/webhooks/subscriptions/{subscriptionId}` – delete a webhook subscription by ID

### Webhooks

Provide `Dwolla__WebhookSecret` from your Dwolla application settings and configure Dwolla to send webhooks to
`/api/webhooks`. The API validates the Dwolla signature header, logs accepted payloads in memory, and exposes the
recent event log through `GET /api/webhooks/events` for quick inspection while developing locally. Use the webhook
subscription endpoints to manage callback URLs and secrets directly from this API when automating setup.
