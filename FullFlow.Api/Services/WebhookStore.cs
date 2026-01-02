using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DwollaFullFlow.Api.Configuration;
using Microsoft.Extensions.Options;

namespace DwollaFullFlow.Api.Services
{
    public interface IWebhookStore
    {
        bool Add(WebhookEventRecord record);
        IReadOnlyCollection<WebhookEventRecord> GetAll(string? resourceId = null);
        void Clear();
    }

    public class InMemoryWebhookStore : IWebhookStore
    {
        private const int MaxEvents = 200;
        private readonly ConcurrentQueue<WebhookEventRecord> _events = new();
        private readonly ConcurrentDictionary<string, bool> _knownIds = new(StringComparer.OrdinalIgnoreCase);

        public bool Add(WebhookEventRecord record)
        {
            var key = BuildKey(record);
            if (!_knownIds.TryAdd(key, true))
            {
                return false;
            }

            _events.Enqueue(record);

            while (_events.Count > MaxEvents && _events.TryDequeue(out var removed))
            {
                if (removed?.Id != null)
                {
                    _knownIds.TryRemove(BuildKey(removed), out _);
                }
            }

            return true;
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

            _knownIds.Clear();
        }

        private static string BuildKey(WebhookEventRecord record)
        {
            return record.Id ?? WebhookStoreKeyHelper.ComputePayloadHash(record.RawPayload);
        }
    }

    public class PersistentWebhookStore : IWebhookStore
    {
        private readonly List<WebhookEventRecord> _events = new();
        private readonly HashSet<string> _knownKeys = new(StringComparer.OrdinalIgnoreCase);
        private readonly string _filePath;
        private readonly int _maxEvents;
        private readonly object _sync = new();

        public PersistentWebhookStore(IOptions<WebhookStoreOptions> options)
        {
            var storeOptions = options.Value;
            _filePath = string.IsNullOrWhiteSpace(storeOptions.FilePath)
                ? "webhook-events.jsonl"
                : storeOptions.FilePath;
            _maxEvents = Math.Max(1, storeOptions.MaxEvents);

            LoadFromDisk();
        }

        public bool Add(WebhookEventRecord record)
        {
            lock (_sync)
            {
                var key = WebhookStoreKeyHelper.BuildKey(record);
                if (_knownKeys.Contains(key))
                {
                    return false;
                }

                _knownKeys.Add(key);
                _events.Add(record);

                TrimIfNeeded();
                Persist();
                return true;
            }
        }

        public IReadOnlyCollection<WebhookEventRecord> GetAll(string? resourceId = null)
        {
            lock (_sync)
            {
                IEnumerable<WebhookEventRecord> query = _events;
                if (!string.IsNullOrWhiteSpace(resourceId))
                {
                    query = query.Where(e => string.Equals(e.ResourceId, resourceId, StringComparison.OrdinalIgnoreCase));
                }

                return query
                    .OrderByDescending(e => e.ReceivedAt)
                    .ToArray();
            }
        }

        public void Clear()
        {
            lock (_sync)
            {
                _events.Clear();
                _knownKeys.Clear();
                Persist();
            }
        }

        private void TrimIfNeeded()
        {
            while (_events.Count > _maxEvents)
            {
                var removed = _events[0];
                _events.RemoveAt(0);
                _knownKeys.Remove(WebhookStoreKeyHelper.BuildKey(removed));
            }
        }

        private void LoadFromDisk()
        {
            if (!File.Exists(_filePath))
            {
                return;
            }

            try
            {
                var lines = File.ReadAllLines(_filePath);
                foreach (var line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line))
                    {
                        continue;
                    }

                    var record = JsonSerializer.Deserialize<WebhookEventRecord>(line);
                    if (record == null)
                    {
                        continue;
                    }

                    var key = WebhookStoreKeyHelper.BuildKey(record);
                    if (_knownKeys.Add(key))
                    {
                        _events.Add(record);
                    }
                }

                TrimIfNeeded();
            }
            catch
            {
                // If the log is corrupt, fall back to an empty store rather than failing the API startup.
                _events.Clear();
                _knownKeys.Clear();
            }
        }

        private void Persist()
        {
            try
            {
                var directory = Path.GetDirectoryName(_filePath);
                if (!string.IsNullOrWhiteSpace(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var serialized = _events.Select(e => JsonSerializer.Serialize(e));
                File.WriteAllLines(_filePath, serialized);
            }
            catch
            {
                // Persistence should be best-effort; avoid throwing during webhook handling.
            }
        }
    }

    public static class WebhookStoreKeyHelper
    {
        public static string BuildKey(WebhookEventRecord record)
        {
            return record.Id ?? ComputePayloadHash(record.RawPayload);
        }

        public static string ComputePayloadHash(string payload)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(payload ?? string.Empty);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToHexString(hash);
        }
    }
}
