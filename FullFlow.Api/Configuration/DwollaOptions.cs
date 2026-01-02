namespace DwollaFullFlow.Api.Configuration
{
    public class DwollaOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public bool IsSandbox { get; set; } = true;
    }
}
