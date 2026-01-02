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
    [Route("api/exchanges")]
    public class ExchangesController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public ExchangesController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpGet("partners")]
        public async Task<ActionResult<IEnumerable<ExchangePartnerDto>>> GetExchangePartners(
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetExchangePartnersAsync(limit, offset);
                var partners = response.Embedded?.Results()?.Select(p => new ExchangePartnerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Status = p.Status,
                    Created = p.Created
                }) ?? Enumerable.Empty<ExchangePartnerDto>();

                return Ok(partners);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExchangeDto>>> GetExchanges(
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetExchangesAsync(limit, offset);
                var exchanges = response.Embedded?.Results()?.Select(e => new ExchangeDto
                {
                    Id = e.Id,
                    Status = e.Status,
                    Created = e.Created
                }) ?? Enumerable.Empty<ExchangeDto>();

                return Ok(exchanges);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{exchangeId}")]
        public async Task<ActionResult<ExchangeDto>> GetExchange(string exchangeId)
        {
            try
            {
                var exchange = await _gateway.GetExchangeAsync(exchangeId);
                return Ok(new ExchangeDto
                {
                    Id = exchange.Id,
                    Status = exchange.Status,
                    Created = exchange.Created
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ExchangeDto>> CreateExchange([FromBody] CreateExchangeDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateExchangeRequest
                {
                    Links = new Dictionary<string, Link>
                    {
                        { "customer", new Link { Href = new Uri($"{_gateway.ApiBaseAddress}/customers/{model.CustomerId}") } }
                    },
                    Token = model.Token,
                    Finicity = string.IsNullOrWhiteSpace(model.FinicityApplicationId) ? null : new { applicationId = model.FinicityApplicationId }
                };

                var exchange = await _gateway.CreateExchangeAsync(request);
                return Created(new Uri($"{_gateway.ApiBaseAddress}/exchanges/{exchange.Id}"), new ExchangeDto
                {
                    Id = exchange.Id,
                    Status = exchange.Status,
                    Created = exchange.Created
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
