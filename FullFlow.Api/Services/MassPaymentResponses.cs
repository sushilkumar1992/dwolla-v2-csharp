using System.Collections.Generic;
using System.Text.Json.Serialization;
using Dwolla.Client.Models;
using Dwolla.Client.Models.Responses;

namespace DwollaFullFlow.Api.Services
{
    public class MassPaymentItemResponse : BaseResponse
    {
        public string Id { get; set; }
        public string Status { get; set; }
        public Money Amount { get; set; }
        public Dictionary<string, Link> Links { get; set; }
        public string CorrelationId { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
    }

    public class GetMassPaymentItemsResponse : BaseGetResponse<MassPaymentItemResponse>
    {
        [JsonPropertyName("_embedded")]
        public new MassPaymentItemEmbed Embedded { get; set; }
    }

    public class MassPaymentItemEmbed : Embed<MassPaymentItemResponse>
    {
        [JsonPropertyName("items")]
        public List<MassPaymentItemResponse> Items { get; set; }

        public override List<MassPaymentItemResponse> Results() => Items;
    }
}
