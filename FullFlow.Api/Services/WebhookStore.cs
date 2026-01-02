using System.Collections.Concurrent;

namespace DwollaFullFlow.Api.Services
{
    public interface IWebhookStore
    {
        void Add(WebhookEventRecord record);
        IReadOnlyCollection<WebhookEventRecord> GetAll(string? resourceId = null);
        void Clear();
    }

    public class InMemoryWebhookStore : IWebhookStore
    {
        private const int MaxEvents = 200;
        private readonly ConcurrentQueue<WebhookEventRecord> _events = new();

        public void Add(WebhookEventRecord record)
        {
            _events.Enqueue(record);

            while (_events.Count > MaxEvents && _events.TryDequeue(out _))
            {
            }
        }

        public IReadOnlyCollection<WebhookEventRecord> GetAll(string? resourceId = null)
        {
            var items = _events.ToArray();
            if (string.IsNullOrWhiteSpace(resourceId))
            {
                return items.OrderByDescending(e => e.ReceivedAt).ToArray();
            }

            return items
                .Where(e => string.Equals(e.ResourceId, resourceId, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(e => e.ReceivedAt)
                .ToArray();
        }

        public void Clear()
        {
            while (_events.TryDequeue(out _))
            {
            }
        }
    }
}
