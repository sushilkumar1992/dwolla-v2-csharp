using System;
using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class CreateBeneficialOwnerDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [RegularExpression("^[0-9]{4}$|^[0-9]{9}$", ErrorMessage = "Provide last 4 SSN digits or full 9-digit SSN.")]
        public string Ssn { get; set; } = string.Empty;

        [Required]
        public string Address1 { get; set; } = string.Empty;

        public string? Address2 { get; set; }

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(2, MinimumLength = 2)]
        public string State { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[0-9]{5}(-[0-9]{4})?$")]
        public string PostalCode { get; set; } = string.Empty;

        public string? Country { get; set; }

        public string? PassportNumber { get; set; }
        public string? PassportCountry { get; set; }
    }

    public class BeneficialOwnerSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Address1 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
    }

    public class CertifyBeneficialOwnershipDto
    {
        [Required]
        public string Status { get; set; } = "certified";
    }
}
