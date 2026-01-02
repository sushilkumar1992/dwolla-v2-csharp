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
    [Route("api")]
    public class BeneficialOwnersController : DwollaControllerBase
    {
        private readonly IDwollaGateway _gateway;

        public BeneficialOwnersController(IDwollaGateway gateway)
        {
            _gateway = gateway;
        }

        [HttpPost("customers/{customerId}/beneficial-owners")]
        public async Task<ActionResult<BeneficialOwnerSummaryDto>> CreateBeneficialOwner(string customerId, [FromBody] CreateBeneficialOwnerDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var request = new CreateBeneficialOwnerRequest
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    DateOfBirth = model.DateOfBirth,
                    Ssn = model.Ssn,
                    Address = new Address
                    {
                        Address1 = model.Address1,
                        Address2 = model.Address2 ?? string.Empty,
                        City = model.City,
                        StateProvinceRegion = model.State,
                        PostalCode = model.PostalCode,
                        Country = model.Country ?? "US"
                    },
                    Passport = string.IsNullOrWhiteSpace(model.PassportNumber)
                        ? null
                        : new Passport { Number = model.PassportNumber!, Country = model.PassportCountry ?? "US" }
                };

                var owner = await _gateway.CreateBeneficialOwnerAsync(customerId, request);
                return CreatedAtAction(nameof(GetBeneficialOwnerById), new { beneficialOwnerId = owner.Id }, ToDto(owner));
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("customers/{customerId}/beneficial-owners")]
        public async Task<ActionResult<IEnumerable<BeneficialOwnerSummaryDto>>> GetBeneficialOwners(
            string customerId,
            [FromQuery, Range(1, 200)] int limit = 10,
            [FromQuery, Range(0, int.MaxValue)] int offset = 0)
        {
            try
            {
                var response = await _gateway.GetBeneficialOwnersAsync(customerId, limit, offset);
                var owners = response.Embedded?.Results()?.Select(ToDto) ?? Enumerable.Empty<BeneficialOwnerSummaryDto>();
                return Ok(owners);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("beneficial-owners/{beneficialOwnerId}")]
        public async Task<ActionResult<BeneficialOwnerSummaryDto>> GetBeneficialOwnerById(string beneficialOwnerId)
        {
            try
            {
                var owner = await _gateway.GetBeneficialOwnerAsync(beneficialOwnerId);
                return Ok(ToDto(owner));
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("customers/{customerId}/beneficial-ownership/certify")]
        public async Task<ActionResult<BeneficialOwnershipResponse>> CertifyBeneficialOwnership(string customerId, [FromBody] CertifyBeneficialOwnershipDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var certification = await _gateway.CertifyBeneficialOwnershipAsync(customerId, new CertifyBeneficialOwnershipRequest
                {
                    Status = model.Status
                });

                return Ok(certification);
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpGet("customers/{customerId}/beneficial-ownership")]
        public async Task<ActionResult<BeneficialOwnershipStatusDto>> GetBeneficialOwnershipStatus(string customerId)
        {
            try
            {
                var status = await _gateway.GetBeneficialOwnershipStatusAsync(customerId);
                return Ok(new BeneficialOwnershipStatusDto
                {
                    Status = status.Status,
                    Created = status.Created,
                    Certified = status.Certified
                });
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpPost("customers/{customerId}/beneficial-owners/{beneficialOwnerId}")]
        public async Task<IActionResult> AttachExistingBeneficialOwner(string customerId, string beneficialOwnerId)
        {
            try
            {
                await _gateway.AttachBeneficialOwnerAsync(customerId, beneficialOwnerId);
                return NoContent();
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        [HttpDelete("beneficial-owners/{beneficialOwnerId}")]
        public async Task<IActionResult> DeleteBeneficialOwner(string beneficialOwnerId)
        {
            try
            {
                await _gateway.DeleteBeneficialOwnerAsync(beneficialOwnerId);
                return NoContent();
            }
            catch (DwollaApiException ex)
            {
                return ProblemFromDwolla(ex);
            }
        }

        private static BeneficialOwnerSummaryDto ToDto(Dwolla.Client.Models.Responses.BeneficialOwnerResponse owner)
        {
            return new BeneficialOwnerSummaryDto
            {
                Id = owner.Id,
                FirstName = owner.FirstName,
                LastName = owner.LastName,
                Status = owner.VerificationStatus,
                Address1 = owner.Address?.Address1,
                City = owner.Address?.City,
                State = owner.Address?.StateProvinceRegion
            };
        }
    }
}
