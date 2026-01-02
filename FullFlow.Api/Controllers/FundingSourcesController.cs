using System;
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

        [HttpPost("plaid")]
        public async Task<ActionResult<FundingSourceSummaryDto>> CreatePlaidFundingSource([FromBody] CreatePlaidFundingSourceDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreatePlaidFundingSourceRequest
                {
                    Name = model.Name,
                    PlaidToken = model.PlaidToken,
                    Links = new Dictionary<string, Link>
                    {
                        { "customer", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/customers/{model.CustomerId}") } }
                    }
                };

                var fundingSource = await _gateway.CreatePlaidFundingSourceAsync(request);
                return Created(new Uri($"{_gateway.ApiBaseAddress}/funding-sources/{fundingSource.Id}"), new FundingSourceSummaryDto
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

        [HttpGet("{fundingSourceId}/balance")]
        public async Task<ActionResult<FundingSourceBalanceDto>> GetFundingSourceBalance(string fundingSourceId)
        {
            try
            {
                var balance = await _gateway.GetFundingSourceBalanceAsync(fundingSourceId);
                return Ok(new FundingSourceBalanceDto
                {
                    Balance = balance.Balance?.Value ?? 0,
                    Currency = balance.Balance?.Currency ?? "USD",
                    LastUpdated = balance.LastUpdated,
                    Status = balance.Status
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

        [HttpPost("{fundingSourceId}/micro-deposits/initiate")]
        public async Task<ActionResult<MicroDepositStatusDto>> InitiateMicroDeposits(string fundingSourceId)
        {
            try
            {
                var response = await _gateway.InitiateMicroDepositsAsync(fundingSourceId);
                return Ok(new MicroDepositStatusDto
                {
                    Created = response.Created,
                    Status = response.Status,
                    FailureReason = response.Failure?.Reason
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{fundingSourceId}/micro-deposits")]
        public async Task<ActionResult<MicroDepositStatusDto>> GetMicroDepositStatus(string fundingSourceId)
        {
            try
            {
                var response = await _gateway.GetMicroDepositStatusAsync(fundingSourceId);
                return Ok(new MicroDepositStatusDto
                {
                    Created = response.Created,
                    Status = response.Status,
                    FailureReason = response.Failure?.Reason
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{fundingSourceId}/micro-deposits/verify")]
        public async Task<ActionResult<MicroDepositStatusDto>> VerifyMicroDeposits(string fundingSourceId, [FromBody] MicroDepositVerificationDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var response = await _gateway.VerifyMicroDepositsAsync(fundingSourceId, model.Amount1, model.Amount2, model.Currency);
                return Ok(new MicroDepositStatusDto
                {
                    Created = response.Created,
                    Status = response.Status,
                    FailureReason = response.Failure?.Reason
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
