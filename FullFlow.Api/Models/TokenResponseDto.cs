namespace DwollaFullFlow.Api.Models
{
    public class TokenResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }
}
