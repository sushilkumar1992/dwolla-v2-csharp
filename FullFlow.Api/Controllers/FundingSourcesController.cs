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
    }
}
