using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public EventsController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EventSummaryDto>>> GetEvents(
            [FromQuery, Range(1, 200)] int limit = 25,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0,
            [FromQuery] string? resourceId = null,
            [FromQuery] string? topic = null)
        {
            try
            {
                var response = await _gateway.GetEventsAsync(limit, offset, resourceId, topic);
                var events = response.Embedded?.Results()?.Select(e => new EventSummaryDto
                {
                    Id = e.Id,
                    Topic = e.Topic,
                    ResourceId = e.ResourceId,
                    Created = e.Created
                }) ?? Enumerable.Empty<EventSummaryDto>();

                return Ok(events);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventDetailDto>> GetEvent(string id)
        {
            try
            {
                var evt = await _gateway.GetEventAsync(id);
                return Ok(new EventDetailDto
                {
                    Id = evt.Id,
                    Topic = evt.Topic,
                    ResourceId = evt.ResourceId,
                    Created = evt.Created
                });
            }
            catch (DwollaApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
