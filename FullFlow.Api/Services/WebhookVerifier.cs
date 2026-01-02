using System.Security.Cryptography;
using System.Text;

namespace DwollaFullFlow.Api.Services
{
    public interface IWebhookVerifier
    {
        bool IsSignatureValid(string secret, string signature, string payload);
    }

    public class HmacSha256WebhookVerifier : IWebhookVerifier
    {
        public bool IsSignatureValid(string secret, string signature, string payload)
        {
            if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(signature))
            {
                return false;
            }

            var secretBytes = Encoding.UTF8.GetBytes(secret);
            using var hasher = new HMACSHA256(secretBytes);
            var payloadBytes = Encoding.UTF8.GetBytes(payload);
            var hash = hasher.ComputeHash(payloadBytes);
            var computed = BitConverter.ToString(hash).Replace("-", string.Empty).ToLowerInvariant();

            return string.Equals(computed, signature.Trim(), StringComparison.OrdinalIgnoreCase);
        }
    }
}
