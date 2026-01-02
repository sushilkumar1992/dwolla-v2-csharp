using Dwolla.Client.Models;

namespace DwollaFullFlow.Api.Services
{
    public class CreateRefundRequest
    {
        public Money Amount { get; set; }
        public string? CorrelationId { get; set; }
    }
}
