using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using Dwolla.Client.Models.Requests;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/customers")]
    public class CustomersController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public CustomersController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerSummaryDto>>> GetCustomers(
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetCustomersAsync(limit, offset);
                var customers = response.Embedded?.Results()?.Select(c => new CustomerSummaryDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    Status = c.Status,
                    Created = c.Created
                }) ?? Enumerable.Empty<CustomerSummaryDto>();

                return Ok(customers);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerSummaryDto>> GetCustomerById(string id)
        {
            try
            {
                var customer = await _gateway.GetCustomerAsync(id);
                return Ok(new CustomerSummaryDto
                {
                    Id = customer.Id,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Status = customer.Status,
                    Created = customer.Created
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<CustomerSummaryDto>> CreateCustomer([FromBody] CreateCustomerDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateCustomerRequest
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Email = model.Email,
                    Type = model.Type,
                    IpAddress = model.IpAddress,
                    Address1 = model.Address1,
                    Address2 = model.Address2,
                    City = model.City,
                    State = model.State,
                    PostalCode = model.PostalCode,
                    Phone = model.Phone,
                    DateOfBirth = model.DateOfBirth,
                    Ssn = model.Ssn,
                    BusinessName = model.BusinessName,
                    BusinessType = model.BusinessType,
                    BusinessClassification = model.BusinessClassification,
                    Ein = model.Ein,
                    DoingBusinessAs = model.DoingBusinessAs,
                    Website = model.Website
                };

                var customer = await _gateway.CreateCustomerAsync(request);
                var summary = new CustomerSummaryDto
                {
                    Id = customer.Id,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Status = customer.Status,
                    Created = customer.Created
                };

                return CreatedAtAction(nameof(GetCustomerById), new { id = summary.Id }, summary);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{id}/documents")]
        public async Task<ActionResult<IEnumerable<DocumentSummaryDto>>> GetCustomerDocuments(
            string id,
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetCustomerDocumentsAsync(id, limit, offset);
                var documents = response.Embedded?.Results()?.Select(d => new DocumentSummaryDto
                {
                    Id = d.Id,
                    Status = d.Status,
                    Type = d.Type,
                    Created = d.Created,
                    FailureReason = d.FailureReason
                }) ?? Enumerable.Empty<DocumentSummaryDto>();

                return Ok(documents);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{id}/documents")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<ActionResult<DocumentSummaryDto>> UploadCustomerDocument(
            string id,
            [FromForm] UploadCustomerDocumentDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (model.File == null || model.File.Length == 0)
            {
                ModelState.AddModelError(nameof(model.File), "A document file is required.");
                return ValidationProblem(ModelState);
            }

            await using var stream = new MemoryStream();
            await model.File.CopyToAsync(stream);
            stream.Position = 0;

            try
            {
                var document = await _gateway.UploadCustomerDocumentAsync(
                    id,
                    model.DocumentType,
                    stream,
                    model.File.FileName,
                    model.File.ContentType ?? "application/octet-stream");

                var summary = new DocumentSummaryDto
                {
                    Id = document.Id,
                    Status = document.Status,
                    Type = document.Type,
                    Created = document.Created,
                    FailureReason = document.FailureReason
                };

                return CreatedAtAction(nameof(GetCustomerDocuments), new { id }, summary);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
