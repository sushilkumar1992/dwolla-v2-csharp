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
}
