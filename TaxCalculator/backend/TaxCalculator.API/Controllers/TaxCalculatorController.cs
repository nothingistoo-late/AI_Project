using Microsoft.AspNetCore.Mvc;
using TaxCalculator.API.DTOs;
using TaxCalculator.Business.Services;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxCalculatorController : ControllerBase
{
    private readonly ITaxCalculationService _taxCalculationService;
    private readonly ILogger<TaxCalculatorController> _logger;

    public TaxCalculatorController(
        ITaxCalculationService taxCalculationService,
        ILogger<TaxCalculatorController> logger)
    {
        _taxCalculationService = taxCalculationService;
        _logger = logger;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<TaxCalculationResult>> CalculateTax([FromBody] CalculateTaxDto dto)
    {
        try
        {
            TaxCalculationResult result;

            if (dto.Mode == "GrossToNet")
            {
                result = await _taxCalculationService.CalculateGrossToNetAsync(
                    dto.Income,
                    dto.TaxConfigId,
                    dto.NumberOfDependents,
                    dto.FreelanceIncome,
                    dto.BonusIncome,
                    dto.OtherIncome);
            }
            else if (dto.Mode == "NetToGross")
            {
                result = await _taxCalculationService.CalculateNetToGrossAsync(
                    dto.Income,
                    dto.TaxConfigId,
                    dto.NumberOfDependents,
                    dto.FreelanceIncome,
                    dto.BonusIncome,
                    dto.OtherIncome);
            }
            else
            {
                return BadRequest(new { error = "Invalid mode. Use 'GrossToNet' or 'NetToGross'." });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating tax");
            return StatusCode(500, new { error = "An error occurred while calculating tax." });
        }
    }

    [HttpPost("compare")]
    public async Task<ActionResult<TaxCalculationResult>> CompareTaxSystems([FromBody] CompareTaxDto dto)
    {
        try
        {
            var result = await _taxCalculationService.CompareTaxSystemsAsync(
                dto.GrossIncome,
                dto.TaxConfigIds,
                dto.NumberOfDependents);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing tax systems");
            return StatusCode(500, new { error = "An error occurred while comparing tax systems." });
        }
    }
}

