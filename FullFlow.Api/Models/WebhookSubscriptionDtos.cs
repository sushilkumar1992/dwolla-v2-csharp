using System;
using System.ComponentModel.DataAnnotations;
using Dwolla.Client.Models.Responses;

namespace DwollaFullFlow.Api.Models
{
    public record CreateWebhookSubscriptionDto
    {
        [Required]
        [Url]
        public string Url { get; init; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Secret { get; init; } = string.Empty;
    }

    public record WebhookSubscriptionDto
    {
        public string Id { get; init; } = string.Empty;
        public string Url { get; init; } = string.Empty;
        public bool Paused { get; init; }
        public DateTime Created { get; init; }

        public static WebhookSubscriptionDto FromResponse(WebhookSubscription subscription) => new()
        {
            Id = subscription.Id,
            Url = subscription.Url,
            Paused = subscription.Paused,
            Created = subscription.Created
        };
    }
}
