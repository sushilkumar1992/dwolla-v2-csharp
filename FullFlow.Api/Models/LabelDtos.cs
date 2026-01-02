using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class CreateLabelDto
    {
        [Required]
        [Range(0.01, 1_000_000, ErrorMessage = "Amount must be positive.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";
    }

    public class LabelDto
    {
        public string Id { get; set; }
        public DateTime Created { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
    }

    public class LabelLedgerEntryDto
    {
        public string Id { get; set; }
        public DateTime Created { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
    }

    public class CreateLabelLedgerEntryDto
    {
        [Required]
        [Range(-1_000_000, 1_000_000, ErrorMessage = "Amount cannot be zero.")]
        [NotEqualToZero]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";
    }

    public class CreateLabelReallocationDto
    {
        [Required]
        public string DestinationLabelId { get; set; }

        [Required]
        [Range(0.01, 1_000_000, ErrorMessage = "Amount must be positive.")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = "USD";
    }

    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public sealed class NotEqualToZeroAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
        {
            if (value is decimal decimalValue)
            {
                return decimalValue != 0;
            }

            return true;
        }

        public override string FormatErrorMessage(string name) => $"{name} cannot be zero.";
    }
}
