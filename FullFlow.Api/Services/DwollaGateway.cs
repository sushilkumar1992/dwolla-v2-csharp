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
        Task<Uri> CreateFundingSourceAsync(string customerId, CreateFundingSourceRequest request);
        Task<FundingSource> GetFundingSourceAsync(Uri fundingSourceUri);
        Task<FundingSource> GetFundingSourceAsync(string fundingSourceId);
        Task<Uri> CreateTransferAsync(CreateTransferRequest request);
        Task<TransferResponse> GetTransferAsync(Uri transferUri);
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
