using Microsoft.AspNetCore.Mvc;
using TaxCalculator.API.DTOs;
using TaxCalculator.Business.Services;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PresetController : ControllerBase
{
    private readonly IPresetService _presetService;
    private readonly ILogger<PresetController> _logger;

    public PresetController(
        IPresetService presetService,
        ILogger<PresetController> logger)
    {
        _presetService = presetService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CalculationPreset>>> GetAllPresets()
    {
        try
        {
            var presets = await _presetService.GetAllPresetsAsync();
            return Ok(presets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all presets");
            return StatusCode(500, new { error = "An error occurred while retrieving presets." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CalculationPreset>> GetPresetById(int id)
    {
        try
        {
            var preset = await _presetService.GetPresetByIdAsync(id);
            if (preset == null)
                return NotFound(new { error = $"Preset with ID {id} not found." });

            return Ok(preset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting preset by ID");
            return StatusCode(500, new { error = "An error occurred while retrieving the preset." });
        }
    }

    [HttpGet("config/{taxConfigId}")]
    public async Task<ActionResult<IEnumerable<CalculationPreset>>> GetPresetsByConfigId(int taxConfigId)
    {
        try
        {
            var presets = await _presetService.GetPresetsByConfigIdAsync(taxConfigId);
            return Ok(presets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting presets by config ID");
            return StatusCode(500, new { error = "An error occurred while retrieving presets." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<CalculationPreset>> CreatePreset([FromBody] CreatePresetDto dto)
    {
        try
        {
            var preset = new CalculationPreset
            {
                Name = dto.Name,
                Description = dto.Description,
                TaxConfigId = dto.TaxConfigId,
                GrossIncome = dto.GrossIncome,
                NetIncome = dto.NetIncome,
                NumberOfDependents = dto.NumberOfDependents,
                CalculationMode = dto.CalculationMode,
                FreelanceIncome = dto.FreelanceIncome,
                BonusIncome = dto.BonusIncome,
                OtherIncome = dto.OtherIncome
            };

            var createdPreset = await _presetService.CreatePresetAsync(preset);
            return CreatedAtAction(nameof(GetPresetById), new { id = createdPreset.Id }, createdPreset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating preset");
            return StatusCode(500, new { error = "An error occurred while creating the preset." });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CalculationPreset>> UpdatePreset(int id, [FromBody] CreatePresetDto dto)
    {
        try
        {
            var preset = await _presetService.GetPresetByIdAsync(id);
            if (preset == null)
                return NotFound(new { error = $"Preset with ID {id} not found." });

            preset.Name = dto.Name;
            preset.Description = dto.Description;
            preset.TaxConfigId = dto.TaxConfigId;
            preset.GrossIncome = dto.GrossIncome;
            preset.NetIncome = dto.NetIncome;
            preset.NumberOfDependents = dto.NumberOfDependents;
            preset.CalculationMode = dto.CalculationMode;
            preset.FreelanceIncome = dto.FreelanceIncome;
            preset.BonusIncome = dto.BonusIncome;
            preset.OtherIncome = dto.OtherIncome;

            var updatedPreset = await _presetService.UpdatePresetAsync(preset);
            return Ok(updatedPreset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating preset");
            return StatusCode(500, new { error = "An error occurred while updating the preset." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePreset(int id)
    {
        try
        {
            var deleted = await _presetService.DeletePresetAsync(id);
            if (!deleted)
                return NotFound(new { error = $"Preset with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting preset");
            return StatusCode(500, new { error = "An error occurred while deleting the preset." });
        }
    }
}

