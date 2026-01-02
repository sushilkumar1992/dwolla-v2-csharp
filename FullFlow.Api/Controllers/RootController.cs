using System.Collections.Generic;
using System.Linq;
using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/root")]
    public class RootController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public RootController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpGet]
        public async Task<ActionResult<RootDto>> GetRoot()
        {
            try
            {
                var root = await _gateway.GetRootAsync();
                var links = root.Links?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Href.ToString())
                            ?? new Dictionary<string, string>();

                return Ok(new RootDto
                {
                    ApiBaseAddress = _gateway.ApiBaseAddress,
                    Links = links
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
