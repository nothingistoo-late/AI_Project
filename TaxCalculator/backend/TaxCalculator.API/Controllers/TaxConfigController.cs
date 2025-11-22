using Microsoft.AspNetCore.Mvc;
using TaxCalculator.API.DTOs;
using TaxCalculator.Business.Services;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxConfigController : ControllerBase
{
    private readonly ITaxConfigService _taxConfigService;
    private readonly ILogger<TaxConfigController> _logger;

    public TaxConfigController(
        ITaxConfigService taxConfigService,
        ILogger<TaxConfigController> logger)
    {
        _taxConfigService = taxConfigService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaxConfig>>> GetAllConfigs()
    {
        try
        {
            var configs = await _taxConfigService.GetAllConfigsAsync();
            return Ok(configs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all tax configs");
            return StatusCode(500, new { error = "An error occurred while retrieving tax configs." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaxConfig>> GetConfigById(int id)
    {
        try
        {
            var config = await _taxConfigService.GetConfigByIdAsync(id);
            if (config == null)
                return NotFound(new { error = $"Tax configuration with ID {id} not found." });

            return Ok(config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tax config by ID");
            return StatusCode(500, new { error = "An error occurred while retrieving the tax config." });
        }
    }

    [HttpGet("default")]
    public async Task<ActionResult<TaxConfig>> GetDefaultConfig()
    {
        try
        {
            var config = await _taxConfigService.GetDefaultConfigAsync();
            if (config == null)
                return NotFound(new { error = "No default tax configuration found." });

            return Ok(config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting default tax config");
            return StatusCode(500, new { error = "An error occurred while retrieving the default tax config." });
        }
    }

    [HttpGet("country/{countryCode}")]
    public async Task<ActionResult<IEnumerable<TaxConfig>>> GetConfigsByCountry(string countryCode)
    {
        try
        {
            var configs = await _taxConfigService.GetConfigsByCountryAsync(countryCode);
            return Ok(configs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tax configs by country");
            return StatusCode(500, new { error = "An error occurred while retrieving tax configs." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaxConfig>> CreateConfig([FromBody] CreateTaxConfigDto dto)
    {
        try
        {
            var config = new TaxConfig
            {
                Name = dto.Name,
                CountryCode = dto.CountryCode,
                Currency = dto.Currency,
                SocialInsuranceRate = dto.SocialInsuranceRate,
                HealthInsuranceRate = dto.HealthInsuranceRate,
                UnemploymentInsuranceRate = dto.UnemploymentInsuranceRate,
                PersonalDeduction = dto.PersonalDeduction,
                DependentDeduction = dto.DependentDeduction,
                MaxInsuranceBase = dto.MaxInsuranceBase,
                Notes = dto.Notes,
                IsDefault = dto.IsDefault,
                IsActive = true
            };

            var createdConfig = await _taxConfigService.CreateConfigAsync(config);

            // Add tax brackets
            if (dto.TaxBrackets.Any())
            {
                foreach (var bracketDto in dto.TaxBrackets)
                {
                    createdConfig.TaxBrackets.Add(new TaxBracket
                    {
                        TaxConfigId = createdConfig.Id,
                        MinIncome = bracketDto.MinIncome,
                        MaxIncome = bracketDto.MaxIncome,
                        Rate = bracketDto.Rate
                    });
                }
                createdConfig = await _taxConfigService.UpdateConfigAsync(createdConfig);
            }

            return CreatedAtAction(nameof(GetConfigById), new { id = createdConfig.Id }, createdConfig);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tax config");
            return StatusCode(500, new { error = "An error occurred while creating the tax config." });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaxConfig>> UpdateConfig(int id, [FromBody] UpdateTaxConfigDto dto)
    {
        try
        {
            var config = await _taxConfigService.GetConfigByIdAsync(id);
            if (config == null)
                return NotFound(new { error = $"Tax configuration with ID {id} not found." });

            if (dto.Name != null) config.Name = dto.Name;
            if (dto.CountryCode != null) config.CountryCode = dto.CountryCode;
            if (dto.Currency != null) config.Currency = dto.Currency;
            if (dto.SocialInsuranceRate.HasValue) config.SocialInsuranceRate = dto.SocialInsuranceRate.Value;
            if (dto.HealthInsuranceRate.HasValue) config.HealthInsuranceRate = dto.HealthInsuranceRate.Value;
            if (dto.UnemploymentInsuranceRate.HasValue) config.UnemploymentInsuranceRate = dto.UnemploymentInsuranceRate.Value;
            if (dto.PersonalDeduction.HasValue) config.PersonalDeduction = dto.PersonalDeduction.Value;
            if (dto.DependentDeduction.HasValue) config.DependentDeduction = dto.DependentDeduction.Value;
            if (dto.MaxInsuranceBase.HasValue) config.MaxInsuranceBase = dto.MaxInsuranceBase.Value;
            if (dto.Notes != null) config.Notes = dto.Notes;
            if (dto.IsActive.HasValue) config.IsActive = dto.IsActive.Value;
            if (dto.IsDefault.HasValue && dto.IsDefault.Value)
            {
                await _taxConfigService.SetDefaultConfigAsync(id);
                return Ok(await _taxConfigService.GetConfigByIdAsync(id));
            }

            var updatedConfig = await _taxConfigService.UpdateConfigAsync(config);
            return Ok(updatedConfig);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tax config");
            return StatusCode(500, new { error = "An error occurred while updating the tax config." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteConfig(int id)
    {
        try
        {
            var deleted = await _taxConfigService.DeleteConfigAsync(id);
            if (!deleted)
                return NotFound(new { error = $"Tax configuration with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tax config");
            return StatusCode(500, new { error = "An error occurred while deleting the tax config." });
        }
    }

    [HttpPost("{id}/set-default")]
    public async Task<ActionResult<TaxConfig>> SetDefaultConfig(int id)
    {
        try
        {
            var config = await _taxConfigService.SetDefaultConfigAsync(id);
            return Ok(config);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting default tax config");
            return StatusCode(500, new { error = "An error occurred while setting the default tax config." });
        }
    }
}

