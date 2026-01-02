using System.Collections.Generic;
using System.Linq;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/directory")]
    public class DirectoryController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public DirectoryController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpGet("business-classifications")]
        public async Task<ActionResult<IEnumerable<BusinessClassificationDto>>> GetBusinessClassifications(
            [FromQuery] int limit = 25,
            [FromQuery] int offset = 0)
        {
            try
            {
                var result = await _gateway.GetBusinessClassificationsAsync(limit, offset);
                var list = result.Embedded?.Results()?.Select(bc => new BusinessClassificationDto
                {
                    Id = bc.Id,
                    Name = bc.Name,
                    IndustryClassifications = bc.Embedded?.Results()?.Select(ic => new IndustryClassificationDto
                    {
                        Id = ic.Id,
                        Name = ic.Name
                    }) ?? Enumerable.Empty<IndustryClassificationDto>()
                }) ?? Enumerable.Empty<BusinessClassificationDto>();

                return Ok(list);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
