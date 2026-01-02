using System.Collections.Generic;
using Dwolla.Client.Models;
using Dwolla.Client.Models.Requests;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/transfers")]
    public class TransfersController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public TransfersController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpPost]
        public async Task<ActionResult<TransferSummaryDto>> CreateTransfer([FromBody] CreateTransferDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateTransferRequest
                {
                    Amount = new Money
                    {
                        Currency = model.Currency,
                        Value = model.Amount
                    },
                    Links = new Dictionary<string, Link>
                    {
                        { "source", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/funding-sources/{model.SourceFundingSourceId}") } },
                        { "destination", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/funding-sources/{model.DestinationFundingSourceId}") } }
                    },
                    CorrelationId = model.CorrelationId
                };

                var location = await _gateway.CreateTransferAsync(request);
                var transfer = await _gateway.GetTransferAsync(location);

                return Created(location, new TransferSummaryDto
                {
                    Id = transfer.Id,
                    Status = transfer.Status,
                    Amount = transfer.Amount.Value,
                    Currency = transfer.Amount.Currency
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
