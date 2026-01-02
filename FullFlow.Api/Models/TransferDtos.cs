using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class CreateTransferDto
    {
        [Required]
        public string SourceFundingSourceId { get; set; } = string.Empty;

        [Required]
        public string DestinationFundingSourceId { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";

        public string? CorrelationId { get; set; }
        public string? SourceAddenda { get; set; }
        public string? DestinationAddenda { get; set; }
    }

    public class TransferSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
    }

    public class TransferDetailsDto : TransferSummaryDto
    {
        public DateTime Created { get; set; }
        public string? CorrelationId { get; set; }
        public string? SourceFundingSourceId { get; set; }
        public string? DestinationFundingSourceId { get; set; }
    }
}
