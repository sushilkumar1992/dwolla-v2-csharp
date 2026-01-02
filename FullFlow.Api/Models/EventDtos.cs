using System;

namespace DwollaFullFlow.Api.Models
{
    public class EventSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string ResourceId { get; set; } = string.Empty;
        public DateTime Created { get; set; }
    }

    public class EventDetailDto : EventSummaryDto
    {
    }
}
