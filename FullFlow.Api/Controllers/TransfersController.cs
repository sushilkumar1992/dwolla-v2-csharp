using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
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

        [HttpGet("{transferId}")]
        public async Task<ActionResult<TransferDetailsDto>> GetTransfer(string transferId)
        {
            try
            {
                var transfer = await _gateway.GetTransferAsync(transferId);

                return Ok(new TransferDetailsDto
                {
                    Id = transfer.Id,
                    Status = transfer.Status,
                    Amount = transfer.Amount.Value,
                    Currency = transfer.Amount.Currency,
                    Created = transfer.Created,
                    CorrelationId = transfer.CorrelationId,
                    SourceFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("source")?.Href),
                    DestinationFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("destination")?.Href)
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{transferId}/cancel")]
        public async Task<ActionResult<TransferDetailsDto>> CancelTransfer(string transferId)
        {
            try
            {
                var transfer = await _gateway.CancelTransferAsync(transferId);

                return Ok(new TransferDetailsDto
                {
                    Id = transfer.Id,
                    Status = transfer.Status,
                    Amount = transfer.Amount.Value,
                    Currency = transfer.Amount.Currency,
                    Created = transfer.Created,
                    CorrelationId = transfer.CorrelationId,
                    SourceFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("source")?.Href),
                    DestinationFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("destination")?.Href)
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
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

                var location = await _gateway.CreateTransferAsync(request, model.IdempotencyKey);
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

        [HttpPost("mass-payments")]
        public async Task<ActionResult<MassPaymentSummaryDto>> CreateMassPayment([FromBody] CreateMassPaymentDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateMasspaymentRequest
                {
                    Links = new Dictionary<string, Link>
                    {
                        { "source", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/funding-sources/{model.SourceFundingSourceId}") } }
                    },
                    Items = model.Items.Select(item => new MasspaymentItem
                    {
                        Amount = new Money { Currency = item.Currency, Value = item.Amount },
                        Links = new Dictionary<string, Link>
                        {
                            { "destination", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/funding-sources/{item.DestinationFundingSourceId}") } }
                        },
                        CorrelationId = item.CorrelationId
                    }).ToList(),
                    CorrelationId = model.CorrelationId,
                    Metadata = model.Metadata
                };

                var location = await _gateway.CreateMassPaymentAsync(request, model.IdempotencyKey);
                var id = location.Segments.Last().Trim('/');
                var massPayment = await _gateway.GetMassPaymentAsync(id);

                return Created(location, new MassPaymentSummaryDto
                {
                    Id = massPayment.Id,
                    Status = massPayment.Status,
                    Total = massPayment.Total.Value,
                    TotalFees = massPayment.TotalFees?.Value ?? 0,
                    Currency = massPayment.Total.Currency,
                    Created = massPayment.Created,
                    CorrelationId = massPayment.CorrelationId
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("mass-payments/{massPaymentId}")]
        public async Task<ActionResult<MassPaymentSummaryDto>> GetMassPayment(string massPaymentId)
        {
            try
            {
                var massPayment = await _gateway.GetMassPaymentAsync(massPaymentId);
                return Ok(new MassPaymentSummaryDto
                {
                    Id = massPayment.Id,
                    Status = massPayment.Status,
                    Total = massPayment.Total.Value,
                    TotalFees = massPayment.TotalFees?.Value ?? 0,
                    Currency = massPayment.Total.Currency,
                    Created = massPayment.Created,
                    CorrelationId = massPayment.CorrelationId
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("mass-payments/{massPaymentId}/items")]
        public async Task<ActionResult<IEnumerable<MassPaymentItemSummaryDto>>> GetMassPaymentItems(
            string massPaymentId,
            [FromQuery, Range(1, 200)] int limit = 25,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetMassPaymentItemsAsync(massPaymentId, limit, offset);
                var items = response.Embedded?.Results()?.Select(item => new MassPaymentItemSummaryDto
                {
                    Id = item.Id,
                    Status = item.Status,
                    Amount = item.Amount.Value,
                    Currency = item.Amount.Currency,
                    DestinationFundingSourceId = ExtractIdFromHref(item.Links?.GetValueOrDefault("destination")?.Href),
                    CorrelationId = item.CorrelationId
                }) ?? Enumerable.Empty<MassPaymentItemSummaryDto>();

                return Ok(items);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{transferId}/refunds")]
        public async Task<ActionResult<TransferDetailsDto>> RefundTransfer(string transferId, [FromBody] CreateRefundDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateRefundRequest
                {
                    Amount = new Money { Currency = model.Currency, Value = model.Amount },
                    CorrelationId = model.CorrelationId
                };

                var transfer = await _gateway.CreateTransferRefundAsync(transferId, request, model.IdempotencyKey);

                return Ok(new TransferDetailsDto
                {
                    Id = transfer.Id,
                    Status = transfer.Status,
                    Amount = transfer.Amount.Value,
                    Currency = transfer.Amount.Currency,
                    Created = transfer.Created,
                    CorrelationId = transfer.CorrelationId,
                    SourceFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("source")?.Href),
                    DestinationFundingSourceId = ExtractIdFromHref(transfer.Links?.GetValueOrDefault("destination")?.Href)
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{transferId}/returns")]
        public async Task<ActionResult<IEnumerable<TransferReturnDto>>> GetTransferReturns(
            string transferId,
            [FromQuery, Range(1, 200)] int limit = 25,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetTransferReturnsAsync(transferId, limit, offset);
                var returns = response.Embedded?.Results()?.Select(r => new TransferReturnDto
                {
                    Id = r.Id,
                    Status = r.Status,
                    Amount = r.Amount.Value,
                    Currency = r.Amount.Currency,
                    Code = r.Code,
                    Description = r.Description,
                    Created = r.Created
                }) ?? Enumerable.Empty<TransferReturnDto>();

                return Ok(returns);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        private static string? ExtractIdFromHref(Uri? href)
        {
            if (href == null)
            {
                return null;
            }

            var segments = href.Segments;
            return segments.Length > 0 ? segments[^1].Trim('/') : null;
        }
    }
}
