using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [ApiController]
    public abstract class DwollaControllerBase : ControllerBase
    {
        protected ActionResult ProblemFromDwolla(DwollaApiException ex)
        {
            var statusCode = ex.StatusCode.HasValue ? (int)ex.StatusCode.Value : StatusCodes.Status502BadGateway;
            return Problem(
                detail: ex.Error?.Message ?? ex.Message,
                title: ex.Error?.Code ?? "Dwolla API Error",
                statusCode: statusCode);
        }
    }
}
