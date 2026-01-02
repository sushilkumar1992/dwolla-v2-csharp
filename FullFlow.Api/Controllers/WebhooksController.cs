using System.Text;
using DwollaFullFlow.Api.Configuration;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DwollaFullFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : ControllerBase
    {
        private readonly IWebhookVerifier _verifier;
        private readonly IWebhookStore _store;
        private readonly DwollaOptions _options;

        public WebhooksController(IWebhookVerifier verifier, IWebhookStore store, IOptions<DwollaOptions> options)
        {
            _verifier = verifier;
            _store = store;
            _options = options.Value;
        }

        [HttpPost]
        public async Task<IActionResult> Receive()
        {
            if (string.IsNullOrWhiteSpace(_options.WebhookSecret))
            {
                return BadRequest("Webhook secret has not been configured.");
            }

            var signature = Request.Headers["X-Request-Signature-Sha-256"].FirstOrDefault();
            using var reader = new StreamReader(Request.Body, Encoding.UTF8);
            var payload = await reader.ReadToEndAsync();

            if (!_verifier.IsSignatureValid(_options.WebhookSecret, signature ?? string.Empty, payload))
            {
                return Unauthorized("Invalid webhook signature.");
            }

            var record = WebhookEventRecord.FromJson(payload);
            _store.Add(record);

            return Ok(new
            {
                received = true,
                record.Id,
                record.Topic,
                record.ResourceId,
                record.OccurredAt,
                record.ReceivedAt
            });
        }

        [HttpGet("events")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<IReadOnlyCollection<WebhookEventRecord>> GetEvents([FromQuery] string? resourceId = null)
        {
            var events = _store.GetAll(resourceId);
            return Ok(events);
        }

        [HttpDelete("events")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult Clear()
        {
            _store.Clear();
            return NoContent();
        }
    }
}
