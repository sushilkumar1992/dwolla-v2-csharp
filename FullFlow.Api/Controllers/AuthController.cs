using DwollaFullFlow.Api.Models;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DwollaFullFlow.Api.Controllers
{
    [Route("api/auth")]
    public class AuthController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public AuthController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpPost("token")]
        public async Task<ActionResult<TokenResponseDto>> CreateToken()
        {
            try
            {
                var token = await _gateway.GetAppTokenAsync();
                return Ok(new TokenResponseDto
                {
                    AccessToken = token.Token,
                    ExpiresIn = token.ExpiresIn
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }
    }
}
