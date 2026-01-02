# Dwolla Full Flow API

This ASP.NET Core Web API exposes opinionated endpoints for running an end-to-end Dwolla flow using the local `Dwolla.Client` SDK. It supports creating customers, attaching bank funding sources, generating application tokens, and initiating transfers.

## Configuration

Set environment variables or configuration values for the Dwolla credentials before running:

- `Dwolla__Key` – Dwolla application key
- `Dwolla__Secret` – Dwolla application secret
- `Dwolla__IsSandbox` – `true` for sandbox (default), `false` for production

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
- `POST /api/funding-sources/customers/{customerId}` – add a bank account for a customer
- `POST /api/transfers` – initiate a transfer between two funding sources
