using System.Net;
using Dwolla.Client.Models.Responses;

namespace DwollaFullFlow.Api.Services
{
    public class DwollaApiException : Exception
    {
        public DwollaApiException(string message, HttpStatusCode? statusCode = null, ErrorResponse? error = null)
            : base(message)
        {
            StatusCode = statusCode;
            Error = error;
        }

        public HttpStatusCode? StatusCode { get; }
        public ErrorResponse? Error { get; }
    }
}
