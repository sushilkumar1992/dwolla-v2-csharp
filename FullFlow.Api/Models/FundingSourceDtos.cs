using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class CreateFundingSourceDto
    {
        [Required]
        [RegularExpression("^[0-9]{9}$", ErrorMessage = "Routing number must be 9 digits.")]
        public string RoutingNumber { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[0-9]{4,17}$", ErrorMessage = "Account number must be 4-17 digits.")]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        public string BankAccountType { get; set; } = "checking";

        [Required]
        public string Name { get; set; } = string.Empty;
    }

    public class FundingSourceSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string BankAccountType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Created { get; set; }
    }

    public class MicroDepositVerificationDto
    {
        [Required]
        [Range(0.01, 1_000_000, ErrorMessage = "Amount must be positive.")]
        public decimal Amount1 { get; set; }

        [Required]
        [Range(0.01, 1_000_000, ErrorMessage = "Amount must be positive.")]
        public decimal Amount2 { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";
    }

    public class MicroDepositStatusDto
    {
        public DateTime Created { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? FailureReason { get; set; }
    }

    public class FundingSourceBalanceDto
    {
        public decimal Balance { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTime? LastUpdated { get; set; }
        public string? Status { get; set; }
    }
}
