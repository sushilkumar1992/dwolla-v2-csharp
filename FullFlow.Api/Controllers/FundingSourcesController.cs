using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Dwolla.Client.Models.Requests;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/funding-sources")]
    public class FundingSourcesController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public FundingSourcesController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpPost("customers/{customerId}")]
        public async Task<ActionResult<FundingSourceSummaryDto>> CreateFundingSource(string customerId, [FromBody] CreateFundingSourceDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateFundingSourceRequest
                {
                    RoutingNumber = model.RoutingNumber,
                    AccountNumber = model.AccountNumber,
                    BankAccountType = model.BankAccountType,
                    Name = model.Name
                };

                var location = await _gateway.CreateFundingSourceAsync(customerId, request);
                var fundingSource = await _gateway.GetFundingSourceAsync(location);

                return Created(location, new FundingSourceSummaryDto
                {
                    Id = fundingSource.Id,
                    Name = fundingSource.Name,
                    BankAccountType = fundingSource.BankAccountType,
                    Status = fundingSource.Status,
                    Created = fundingSource.Created
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{fundingSourceId}")]
        public async Task<ActionResult<FundingSourceSummaryDto>> GetFundingSource(string fundingSourceId)
        {
            try
            {
                var fundingSource = await _gateway.GetFundingSourceAsync(fundingSourceId);
                return Ok(new FundingSourceSummaryDto
                {
                    Id = fundingSource.Id,
                    Name = fundingSource.Name,
                    BankAccountType = fundingSource.BankAccountType,
                    Status = fundingSource.Status,
                    Created = fundingSource.Created
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("customers/{customerId}")]
        public async Task<ActionResult<IEnumerable<FundingSourceSummaryDto>>> GetFundingSourcesForCustomer(
            string customerId,
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetFundingSourcesForCustomerAsync(customerId, limit, offset);
                var list = response.Embedded?.Results()?.Select(fs => new FundingSourceSummaryDto
                {
                    Id = fs.Id,
                    Name = fs.Name,
                    BankAccountType = fs.BankAccountType,
                    Status = fs.Status,
                    Created = fs.Created
                }) ?? Enumerable.Empty<FundingSourceSummaryDto>();

                return Ok(list);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
