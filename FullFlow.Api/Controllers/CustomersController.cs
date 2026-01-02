using System;
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
                var customers = response.Embedded?.Results()?.Select(ToSummary) ?? Enumerable.Empty<CustomerSummaryDto>();

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
                return Ok(ToSummary(customer));
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{id}/balance")]
        public async Task<ActionResult<CustomerBalanceDto>> GetCustomerBalance(string id)
        {
            try
            {
                var balance = await _gateway.GetCustomerBalanceAsync(id);
                return Ok(new CustomerBalanceDto
                {
                    Available = balance.Balance?.Value ?? 0,
                    Currency = balance.Balance?.Currency ?? "USD",
                    LastUpdated = balance.LastUpdated
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
                var summary = ToSummary(customer);

                return CreatedAtAction(nameof(GetCustomerById), new { id = summary.Id }, summary);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CustomerSummaryDto>> UpdateCustomer(string id, [FromBody] UpdateCustomerDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new UpdateCustomerRequest
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

                var customer = await _gateway.UpdateCustomerAsync(id, request);
                return Ok(ToSummary(customer));
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{id}/suspend")]
        public async Task<ActionResult<CustomerActionResultDto>> SuspendCustomer(string id)
        {
            return await UpdateStatus(id, _gateway.SuspendCustomerAsync);
        }

        [HttpPost("{id}/deactivate")]
        public async Task<ActionResult<CustomerActionResultDto>> DeactivateCustomer(string id)
        {
            return await UpdateStatus(id, _gateway.DeactivateCustomerAsync);
        }

        [HttpPost("{id}/reactivate")]
        public async Task<ActionResult<CustomerActionResultDto>> ReactivateCustomer(string id)
        {
            return await UpdateStatus(id, _gateway.ReactivateCustomerAsync);
        }

        [HttpPost("{id}/upgrade")]
        public async Task<ActionResult<CustomerActionResultDto>> UpgradeCustomer(string id)
        {
            return await UpdateStatus(id, _gateway.UpgradeCustomerAsync);
        }

        [HttpGet("{id}/iav-token")]
        public async Task<ActionResult<IavTokenDto>> GetIavToken(string id)
        {
            try
            {
                var token = await _gateway.GetIavTokenAsync(id);
                return Ok(new IavTokenDto { Token = token.Token });
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

        private static CustomerSummaryDto ToSummary(Dwolla.Client.Models.Responses.Customer customer)
        {
            return new CustomerSummaryDto
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Status = customer.Status,
                Created = customer.Created
            };
        }

        private async Task<ActionResult<CustomerActionResultDto>> UpdateStatus(string id, Func<string, Task<Dwolla.Client.Models.Responses.Customer>> action)
        {
            try
            {
                var customer = await action(id);
                return Ok(new CustomerActionResultDto
                {
                    Id = customer.Id,
                    Status = customer.Status,
                    Email = customer.Email,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
