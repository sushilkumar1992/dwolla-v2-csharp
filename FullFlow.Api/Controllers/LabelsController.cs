using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Dwolla.Client.Models.Requests;
using Dwolla.Client.Models.Responses;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/labels")]
    public class LabelsController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public LabelsController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpPost]
        public async Task<ActionResult<LabelDto>> CreateLabel([FromBody] CreateLabelDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateLabelRequest
                {
                    Amount = new Money
                    {
                        Value = model.Amount,
                        Currency = model.Currency
                    }
                };

                var label = await _gateway.CreateLabelAsync(request);
                return Created(new Uri($"{_gateway.ApiBaseAddress}/labels/{label.Id}"), new LabelDto
                {
                    Id = label.Id,
                    Created = label.Created,
                    Amount = label.Amount?.Value ?? 0,
                    Currency = label.Amount?.Currency ?? model.Currency
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LabelDto>>> GetLabels(
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetLabelsAsync(limit, offset);
                var labels = response.Embedded?.Results()?.Select(l => new LabelDto
                {
                    Id = l.Id,
                    Created = l.Created,
                    Amount = l.Amount?.Value ?? 0,
                    Currency = l.Amount?.Currency ?? "USD"
                }) ?? Enumerable.Empty<LabelDto>();

                return Ok(labels);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{labelId}")]
        public async Task<ActionResult<LabelDto>> GetLabel(string labelId)
        {
            try
            {
                var label = await _gateway.GetLabelAsync(labelId);
                return Ok(new LabelDto
                {
                    Id = label.Id,
                    Created = label.Created,
                    Amount = label.Amount?.Value ?? 0,
                    Currency = label.Amount?.Currency ?? "USD"
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{labelId}/ledger-entries")]
        public async Task<ActionResult<LabelLedgerEntryDto>> CreateLedgerEntry(string labelId, [FromBody] CreateLabelLedgerEntryDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateLabelLedgerEntryRequest
                {
                    Amount = new Money
                    {
                        Value = model.Amount,
                        Currency = model.Currency
                    }
                };

                var entry = await _gateway.CreateLabelLedgerEntryAsync(labelId, request);
                return Ok(new LabelLedgerEntryDto
                {
                    Id = entry.Id,
                    Created = entry.Created,
                    Amount = entry.Amount?.Value ?? model.Amount,
                    Currency = entry.Amount?.Currency ?? model.Currency
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{labelId}/ledger-entries")]
        public async Task<ActionResult<IEnumerable<LabelLedgerEntryDto>>> GetLedgerEntries(
            string labelId,
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetLabelLedgerEntriesAsync(labelId, limit, offset);
                var entries = response.Embedded?.Results()?.Select(e => new LabelLedgerEntryDto
                {
                    Id = e.Id,
                    Created = e.Created,
                    Amount = e.Amount?.Value ?? 0,
                    Currency = e.Amount?.Currency ?? "USD"
                }) ?? Enumerable.Empty<LabelLedgerEntryDto>();

                return Ok(entries);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("{labelId}/reallocations")]
        public async Task<ActionResult<LabelReallocation>> CreateLabelReallocation(string labelId, [FromBody] CreateLabelReallocationDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateLabelReallocationRequest
                {
                    Links = new Dictionary<string, Link>
                    {
                        { "destination", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/labels/{model.DestinationLabelId}") } }
                    },
                    Amount = new Money
                    {
                        Value = model.Amount,
                        Currency = model.Currency
                    }
                };

                var reallocation = await _gateway.CreateLabelReallocationAsync(labelId, request);
                return Ok(reallocation);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
