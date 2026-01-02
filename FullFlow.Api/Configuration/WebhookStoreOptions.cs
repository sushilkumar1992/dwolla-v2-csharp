namespace DwollaFullFlow.Api.Configuration
{
    public class WebhookStoreOptions
    {
        public int MaxEvents { get; set; } = 500;
        public string? FilePath { get; set; } = "webhook-events.jsonl";
    }
}
