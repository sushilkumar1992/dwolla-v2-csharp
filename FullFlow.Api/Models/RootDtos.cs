using System.Collections.Generic;

namespace DwollaFullFlow.Api.Models
{
    public class RootDto
    {
        public string ApiBaseAddress { get; set; } = string.Empty;
        public Dictionary<string, string> Links { get; set; } = new();
    }
}
