using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DwollaFullFlow.Api.Models
{
    public class UploadCustomerDocumentDto
    {
        [Required]
        public string DocumentType { get; set; } = string.Empty;

        [Required]
        public IFormFile? File { get; set; }
    }

    public class DocumentSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime Created { get; set; }
        public string? FailureReason { get; set; }
    }
}
