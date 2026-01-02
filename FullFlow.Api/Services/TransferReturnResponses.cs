using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Dwolla.Client.Models;
using Dwolla.Client.Models.Responses;

namespace DwollaFullFlow.Api.Services
{
    public class TransferReturnResponse : BaseResponse
    {
        public string Id { get; set; }
        public string Status { get; set; }
        public Money Amount { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public DateTime Created { get; set; }
        public Dictionary<string, Link> Links { get; set; }
    }

    public class GetTransferReturnsResponse : BaseGetResponse<TransferReturnResponse>
    {
        [JsonPropertyName("_embedded")]
        public new TransferReturnEmbed Embedded { get; set; }
    }

    public class TransferReturnEmbed : Embed<TransferReturnResponse>
    {
        [JsonPropertyName("returns")]
        public List<TransferReturnResponse> Returns { get; set; }

        public override List<TransferReturnResponse> Results() => Returns;
    }
}
