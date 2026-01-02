using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class CreateCustomerDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "personal";

        [Required]
        public string Address1 { get; set; } = string.Empty;

        public string? Address2 { get; set; }

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(2, MinimumLength = 2)]
        public string State { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[0-9]{5}(-[0-9]{4})?$", ErrorMessage = "Postal code must be 5 digits or ZIP+4.")]
        public string PostalCode { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        public string? IpAddress { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        public string? Ssn { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessClassification { get; set; }
        public string? Ein { get; set; }
        public string? DoingBusinessAs { get; set; }
        public string? Website { get; set; }
    }

    public class CustomerSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Created { get; set; }
    }

    public class UpdateCustomerDto
    {
        [EmailAddress]
        public string? Email { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Type { get; set; }
        public string? IpAddress { get; set; }

        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }

        [StringLength(2, MinimumLength = 2)]
        public string? State { get; set; }

        [RegularExpression("^[0-9]{5}(-[0-9]{4})?$")] 
        public string? PostalCode { get; set; }

        [Phone]
        public string? Phone { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        public string? Ssn { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public string? BusinessClassification { get; set; }
        public string? Ein { get; set; }
        public string? DoingBusinessAs { get; set; }
        public string? Website { get; set; }
    }

    public class CustomerActionResultDto
    {
        public string Id { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class IavTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
