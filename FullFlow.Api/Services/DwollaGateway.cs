using System.IO;
using System.Text;
using Dwolla.Client;
using Dwolla.Client.Models;
using Dwolla.Client.Models.Requests;
using Dwolla.Client.Models.Responses;
using DwollaFullFlow.Api.Configuration;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace DwollaFullFlow.Api.Services
{
    public interface IDwollaGateway
    {
        string ApiBaseAddress { get; }
        Task<TokenResponse> GetAppTokenAsync();
        Task<Customer> CreateCustomerAsync(CreateCustomerRequest request);
        Task<GetCustomersResponse> GetCustomersAsync(int limit, int offset);
        Task<Customer> GetCustomerAsync(string customerId);
        Task<Customer> UpdateCustomerAsync(string customerId, UpdateCustomerRequest request);
        Task<Customer> SuspendCustomerAsync(string customerId);
        Task<Customer> DeactivateCustomerAsync(string customerId);
        Task<Customer> ReactivateCustomerAsync(string customerId);
        Task<Customer> UpgradeCustomerAsync(string customerId);
        Task<IavTokenResponse> GetIavTokenAsync(string customerId);
        Task<Uri> CreateFundingSourceAsync(string customerId, CreateFundingSourceRequest request);
        Task<GetFundingSourcesResponse> GetFundingSourcesForCustomerAsync(string customerId, int limit, int offset);
        Task<FundingSource> GetFundingSourceAsync(Uri fundingSourceUri);
        Task<FundingSource> GetFundingSourceAsync(string fundingSourceId);
        Task<BalanceResponse> GetFundingSourceBalanceAsync(string fundingSourceId);
        Task<MicroDepositsResponse> InitiateMicroDepositsAsync(string fundingSourceId);
        Task<MicroDepositsResponse> VerifyMicroDepositsAsync(string fundingSourceId, decimal amount1, decimal amount2, string currency = "USD");
        Task<Uri> CreateTransferAsync(CreateTransferRequest request);
        Task<TransferResponse> GetTransferAsync(Uri transferUri);
        Task<TransferResponse> GetTransferAsync(string transferId);
        Task<TransferResponse> CancelTransferAsync(string transferId);
        Task<GetEventsResponse> GetEventsAsync(int limit, int offset, string? resourceId = null, string? topic = null);
        Task<EventResponse> GetEventAsync(string eventId);
        Task<GetDocumentsResponse> GetCustomerDocumentsAsync(string customerId, int limit, int offset);
        Task<DocumentResponse> UploadCustomerDocumentAsync(string customerId, string documentType, Stream fileStream, string filename, string contentType);
        Task<GetWebhookSubscriptionsResponse> GetWebhookSubscriptionsAsync(int limit, int offset);
        Task<Uri> CreateWebhookSubscriptionAsync(CreateWebhookSubscriptionRequest request);
        Task DeleteWebhookSubscriptionAsync(string subscriptionId);
        Task<WebhookSubscription> GetWebhookSubscriptionAsync(Uri subscriptionUri);
        Task<BeneficialOwnerResponse> CreateBeneficialOwnerAsync(string customerId, CreateBeneficialOwnerRequest request);
        Task<GetBeneficialOwnersResponse> GetBeneficialOwnersAsync(string customerId, int limit, int offset);
        Task<BeneficialOwnerResponse> GetBeneficialOwnerAsync(string beneficialOwnerId);
        Task<BeneficialOwnershipResponse> CertifyBeneficialOwnershipAsync(string customerId, CertifyBeneficialOwnershipRequest request);
        Task AttachBeneficialOwnerAsync(string customerId, string beneficialOwnerId);
    }

    public class DwollaGateway : IDwollaGateway
    {
        private const string TokenCacheKey = "dwolla-app-token";
        private readonly IDwollaClient _client;
        private readonly DwollaOptions _options;
        private readonly IMemoryCache _cache;

        public string ApiBaseAddress => _client.ApiBaseAddress;

        public DwollaGateway(IDwollaClient client, IOptions<DwollaOptions> options, IMemoryCache cache)
        {
            _client = client;
            _options = options.Value;
            _cache = cache;
        }

        public async Task<TokenResponse> GetAppTokenAsync()
        {
            if (string.IsNullOrWhiteSpace(_options.Key) || string.IsNullOrWhiteSpace(_options.Secret))
            {
                throw new DwollaApiException("Dwolla API key/secret have not been configured.");
            }

            if (_cache.TryGetValue<TokenResponse>(TokenCacheKey, out var cached))
            {
                return cached;
            }

            var authUri = new Uri($"{_client.ApiBaseAddress}/token");
            var response = await _client.PostAuthAsync<TokenResponse>(authUri, new AppTokenRequest
            {
                Key = _options.Key,
                Secret = _options.Secret
            });

            EnsureSuccess(response);

            var token = response.Content;
            var cacheDuration = TimeSpan.FromSeconds(Math.Max(token.ExpiresIn - 30, 30));
            _cache.Set(TokenCacheKey, token, cacheDuration);
            return token;
        }

        public async Task<Customer> CreateCustomerAsync(CreateCustomerRequest request)
        {
            var headers = await BuildHeadersAsync();
            var createResponse = await _client.PostAsync<CreateCustomerRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers"), request, headers);

            EnsureSuccess(createResponse);

            var location = createResponse.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the new customer.");
            }

            return await GetCustomerByUriAsync(location, headers);
        }

        public async Task<GetCustomersResponse> GetCustomersAsync(int limit, int offset)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/customers?limit={limit}&offset={offset}");
            var response = await _client.GetAsync<GetCustomersResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<Customer> GetCustomerAsync(string customerId)
        {
            var headers = await BuildHeadersAsync();
            return await GetCustomerByUriAsync(new Uri($"{_client.ApiBaseAddress}/customers/{customerId}"), headers);
        }

        public async Task<Customer> UpdateCustomerAsync(string customerId, UpdateCustomerRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<UpdateCustomerRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}"), request, headers);

            EnsureSuccess(response);
            return await GetCustomerByUriAsync(new Uri($"{_client.ApiBaseAddress}/customers/{customerId}"), headers);
        }

        public Task<Customer> SuspendCustomerAsync(string customerId) => PerformCustomerActionAsync(customerId, "suspend");

        public Task<Customer> DeactivateCustomerAsync(string customerId) => PerformCustomerActionAsync(customerId, "deactivate");

        public Task<Customer> ReactivateCustomerAsync(string customerId) => PerformCustomerActionAsync(customerId, "reactivate");

        public Task<Customer> UpgradeCustomerAsync(string customerId) => PerformCustomerActionAsync(customerId, "upgrade");

        public async Task<IavTokenResponse> GetIavTokenAsync(string customerId)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<object, IavTokenResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/iav-token"),
                new { },
                headers);

            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<Uri> CreateFundingSourceAsync(string customerId, CreateFundingSourceRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<CreateFundingSourceRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/funding-sources"), request, headers);
            EnsureSuccess(response);
            var location = response.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the new funding source.");
            }

            return location;
        }

        public async Task<GetFundingSourcesResponse> GetFundingSourcesForCustomerAsync(string customerId, int limit, int offset)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/funding-sources?limit={limit}&offset={offset}");
            var response = await _client.GetAsync<GetFundingSourcesResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<FundingSource> GetFundingSourceAsync(Uri fundingSourceUri)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.GetAsync<FundingSource>(fundingSourceUri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<FundingSource> GetFundingSourceAsync(string fundingSourceId)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/funding-sources/{fundingSourceId}");
            var response = await _client.GetAsync<FundingSource>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<MicroDepositsResponse> InitiateMicroDepositsAsync(string fundingSourceId)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<object, MicroDepositsResponse>(
                new Uri($"{_client.ApiBaseAddress}/funding-sources/{fundingSourceId}/micro-deposits"),
                new { },
                headers);

            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<BalanceResponse> GetFundingSourceBalanceAsync(string fundingSourceId)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/funding-sources/{fundingSourceId}/balance");
            var response = await _client.GetAsync<BalanceResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<MicroDepositsResponse> VerifyMicroDepositsAsync(string fundingSourceId, decimal amount1, decimal amount2, string currency = "USD")
        {
            var headers = await BuildHeadersAsync();
            var request = new MicroDepositsRequest
            {
                Amount1 = new Money { Currency = currency, Value = amount1 },
                Amount2 = new Money { Currency = currency, Value = amount2 }
            };

            var response = await _client.PostAsync<MicroDepositsRequest, MicroDepositsResponse>(
                new Uri($"{_client.ApiBaseAddress}/funding-sources/{fundingSourceId}/micro-deposits"),
                request,
                headers);

            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<Uri> CreateTransferAsync(CreateTransferRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<CreateTransferRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/transfers"), request, headers);
            EnsureSuccess(response);
            var location = response.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the new transfer.");
            }

            return location;
        }

        public async Task<TransferResponse> GetTransferAsync(Uri transferUri)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.GetAsync<TransferResponse>(transferUri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<TransferResponse> GetTransferAsync(string transferId)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/transfers/{transferId}");
            var response = await _client.GetAsync<TransferResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<TransferResponse> CancelTransferAsync(string transferId)
        {
            var headers = await BuildHeadersAsync();
            var cancelUri = new Uri($"{_client.ApiBaseAddress}/transfers/{transferId}/cancel");
            var cancelResponse = await _client.PostAsync<object, EmptyResponse>(cancelUri, new { }, headers);
            EnsureSuccess(cancelResponse);

            var transferUri = new Uri($"{_client.ApiBaseAddress}/transfers/{transferId}");
            var transferResponse = await _client.GetAsync<TransferResponse>(transferUri, headers);
            EnsureSuccess(transferResponse);
            return transferResponse.Content;
        }

        public async Task<GetEventsResponse> GetEventsAsync(int limit, int offset, string? resourceId = null, string? topic = null)
        {
            var headers = await BuildHeadersAsync();
            var query = new StringBuilder($"{_client.ApiBaseAddress}/events?limit={limit}&offset={offset}");
            if (!string.IsNullOrWhiteSpace(resourceId))
            {
                query.Append($"&resourceId={Uri.EscapeDataString(resourceId)}");
            }

            if (!string.IsNullOrWhiteSpace(topic))
            {
                query.Append($"&topic={Uri.EscapeDataString(topic)}");
            }

            var response = await _client.GetAsync<GetEventsResponse>(new Uri(query.ToString()), headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<EventResponse> GetEventAsync(string eventId)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/events/{eventId}");
            var response = await _client.GetAsync<EventResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<GetDocumentsResponse> GetCustomerDocumentsAsync(string customerId, int limit, int offset)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/documents?limit={limit}&offset={offset}");
            var response = await _client.GetAsync<GetDocumentsResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<DocumentResponse> UploadCustomerDocumentAsync(
            string customerId,
            string documentType,
            Stream fileStream,
            string filename,
            string contentType)
        {
            var headers = await BuildHeadersAsync();
            var request = new UploadDocumentRequest
            {
                DocumentType = documentType,
                Document = new File
                {
                    Filename = filename,
                    ContentType = contentType,
                    Stream = fileStream
                }
            };

            var uri = new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/documents");
            var response = await _client.PostAsync<UploadDocumentRequest, EmptyResponse>(uri, request, headers);
            EnsureSuccess(response);

            var location = response.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the document.");
            }

            var documentResponse = await _client.GetAsync<DocumentResponse>(location, headers);
            EnsureSuccess(documentResponse);
            return documentResponse.Content;
        }

        public async Task<GetWebhookSubscriptionsResponse> GetWebhookSubscriptionsAsync(int limit, int offset)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/webhook-subscriptions?limit={limit}&offset={offset}");
            var response = await _client.GetAsync<GetWebhookSubscriptionsResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<Uri> CreateWebhookSubscriptionAsync(CreateWebhookSubscriptionRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<CreateWebhookSubscriptionRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/webhook-subscriptions"),
                request,
                headers);
            EnsureSuccess(response);
            var location = response.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the webhook subscription.");
            }

            return location;
        }

        public async Task DeleteWebhookSubscriptionAsync(string subscriptionId)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/webhook-subscriptions/{subscriptionId}");
            var response = await _client.DeleteAsync(uri, new { }, headers);
            EnsureSuccess(response);
        }

        public async Task<WebhookSubscription> GetWebhookSubscriptionAsync(Uri subscriptionUri)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.GetAsync<WebhookSubscription>(subscriptionUri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<BeneficialOwnerResponse> CreateBeneficialOwnerAsync(string customerId, CreateBeneficialOwnerRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<CreateBeneficialOwnerRequest, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/beneficial-owners"),
                request,
                headers);

            EnsureSuccess(response);
            var location = response.Response?.Headers.Location;
            if (location == null)
            {
                throw new DwollaApiException("Dwolla returned a successful response without a Location header for the beneficial owner.");
            }

            var ownerResponse = await _client.GetAsync<BeneficialOwnerResponse>(location, headers);
            EnsureSuccess(ownerResponse);
            return ownerResponse.Content;
        }

        public async Task<GetBeneficialOwnersResponse> GetBeneficialOwnersAsync(string customerId, int limit, int offset)
        {
            var headers = await BuildHeadersAsync();
            var uri = new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/beneficial-owners?limit={limit}&offset={offset}");
            var response = await _client.GetAsync<GetBeneficialOwnersResponse>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<BeneficialOwnerResponse> GetBeneficialOwnerAsync(string beneficialOwnerId)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.GetAsync<BeneficialOwnerResponse>(
                new Uri($"{_client.ApiBaseAddress}/beneficial-owners/{beneficialOwnerId}"),
                headers);
            EnsureSuccess(response);
            return response.Content;
        }

        public async Task<BeneficialOwnershipResponse> CertifyBeneficialOwnershipAsync(string customerId, CertifyBeneficialOwnershipRequest request)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<CertifyBeneficialOwnershipRequest, BeneficialOwnershipResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/beneficial-ownership"),
                request,
                headers);

            EnsureSuccess(response);
            return response.Content;
        }

        public async Task AttachBeneficialOwnerAsync(string customerId, string beneficialOwnerId)
        {
            var headers = await BuildHeadersAsync();
            var response = await _client.PostAsync<object, EmptyResponse>(
                new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/beneficial-owners/{beneficialOwnerId}"),
                new { },
                headers);

            EnsureSuccess(response);
        }

        private async Task<Customer> PerformCustomerActionAsync(string customerId, string action)
        {
            var headers = await BuildHeadersAsync();
            var actionUri = new Uri($"{_client.ApiBaseAddress}/customers/{customerId}/{action}");
            var response = await _client.PostAsync<object, EmptyResponse>(actionUri, new { }, headers);
            EnsureSuccess(response);

            return await GetCustomerByUriAsync(new Uri($"{_client.ApiBaseAddress}/customers/{customerId}"), headers);
        }

        private async Task<Headers> BuildHeadersAsync()
        {
            var token = await GetAppTokenAsync();
            return new Headers { { "Authorization", $"Bearer {token.Token}" } };
        }

        private async Task<Customer> GetCustomerByUriAsync(Uri uri, Headers headers)
        {
            var response = await _client.GetAsync<Customer>(uri, headers);
            EnsureSuccess(response);
            return response.Content;
        }

        private static void EnsureSuccess<T>(Dwolla.Client.Rest.RestResponse<T> response)
        {
            if (response.Error != null)
            {
                var statusCode = response.Response?.StatusCode;
                throw new DwollaApiException(
                    $"Dwolla request failed: {response.Error.Message}",
                    statusCode,
                    response.Error);
            }

            if (response.Response != null && !response.Response.IsSuccessStatusCode)
            {
                throw new DwollaApiException(
                    $"Dwolla request failed with status code {response.Response.StatusCode}",
                    response.Response.StatusCode);
            }
        }
    }
}
