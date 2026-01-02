using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using Dwolla.Client.Models.Requests;
using DwollaFullFlow.Api.Configuration;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DwollaFullFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : DwollaControllerBase
    {
        private readonly IWebhookVerifier _verifier;
        private readonly IWebhookStore _store;
        private readonly DwollaOptions _options;
        private readonly IDwollaGateway _gateway;

        public WebhooksController(
            IWebhookVerifier verifier,
            IWebhookStore store,
            IOptions<DwollaOptions> options,
            IDwollaGateway gateway)
        {
            _verifier = verifier;
            _store = store;
            _options = options.Value;
            _gateway = gateway;
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

        [HttpGet("subscriptions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<WebhookSubscriptionDto>>> GetSubscriptions(
            [FromQuery, Range(1, 100)] int limit = 25,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetWebhookSubscriptionsAsync(limit, offset);
                var subscriptions = response.Embedded?.Results()?.Select(WebhookSubscriptionDto.FromResponse)
                                    ?? Enumerable.Empty<WebhookSubscriptionDto>();
                return Ok(subscriptions);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("subscriptions")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<ActionResult<WebhookSubscriptionDto>> CreateSubscription(
            [FromBody] CreateWebhookSubscriptionDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateWebhookSubscriptionRequest
                {
                    Secret = model.Secret,
                    Url = model.Url
                };

                var location = await _gateway.CreateWebhookSubscriptionAsync(request);
                var subscription = await _gateway.GetWebhookSubscriptionAsync(location);
                var dto = WebhookSubscriptionDto.FromResponse(subscription);
                return Created(location, dto);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpDelete("subscriptions/{subscriptionId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> DeleteSubscription(string subscriptionId)
        {
            try
            {
                await _gateway.DeleteWebhookSubscriptionAsync(subscriptionId);
                return NoContent();
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
