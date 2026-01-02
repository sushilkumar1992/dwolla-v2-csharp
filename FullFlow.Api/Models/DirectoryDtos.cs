using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DwollaFullFlow.Api.Models
{
    public class BusinessClassificationDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<IndustryClassificationDto> IndustryClassifications { get; set; } = Array.Empty<IndustryClassificationDto>();
    }

    public class IndustryClassificationDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class ExchangePartnerDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public DateTime Created { get; set; }
    }

    public class ExchangeDto
    {
        public string Id { get; set; }
        public string Status { get; set; }
        public DateTime Created { get; set; }
    }

    public class CreateExchangeDto
    {
        [Required]
        public string CustomerId { get; set; }

        [Required]
        public string Token { get; set; }

        public string? FinicityApplicationId { get; set; }
    }
}
