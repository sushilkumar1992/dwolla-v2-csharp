using System.Text.Json;

namespace DwollaFullFlow.Api.Services
{
    public class WebhookEventRecord
    {
        public string? Id { get; init; }
        public string? Topic { get; init; }
        public string? ResourceId { get; init; }
        public DateTimeOffset? OccurredAt { get; init; }
        public DateTimeOffset ReceivedAt { get; init; }
        public string RawPayload { get; init; } = string.Empty;

        public static WebhookEventRecord FromJson(string payload)
        {
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;

            string? resourceHref = null;
            if (root.TryGetProperty("_links", out var links) &&
                links.TryGetProperty("resource", out var resource) &&
                resource.TryGetProperty("href", out var href))
            {
                resourceHref = href.GetString();
            }

            var resourceId = resourceHref?.Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .LastOrDefault();

            return new WebhookEventRecord
            {
                Id = root.TryGetProperty("id", out var id) ? id.GetString() : null,
                Topic = root.TryGetProperty("topic", out var topic) ? topic.GetString() : null,
                OccurredAt = root.TryGetProperty("created", out var created)
                    ? created.GetDateTimeOffset()
                    : null,
                ResourceId = resourceId,
                ReceivedAt = DateTimeOffset.UtcNow,
                RawPayload = payload
            };
        }
    }
}
