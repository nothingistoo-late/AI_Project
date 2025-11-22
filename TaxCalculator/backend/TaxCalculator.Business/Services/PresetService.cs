using TaxCalculator.Data.Repositories;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public class PresetService : IPresetService
{
    private readonly IPresetRepository _presetRepository;

    public PresetService(IPresetRepository presetRepository)
    {
        _presetRepository = presetRepository;
    }

    public async Task<IEnumerable<CalculationPreset>> GetAllPresetsAsync()
    {
        return await _presetRepository.GetAllAsync();
    }

    public async Task<CalculationPreset?> GetPresetByIdAsync(int id)
    {
        return await _presetRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<CalculationPreset>> GetPresetsByConfigIdAsync(int taxConfigId)
    {
        return await _presetRepository.GetByTaxConfigIdAsync(taxConfigId);
    }

    public async Task<CalculationPreset> CreatePresetAsync(CalculationPreset preset)
    {
        preset.CreatedAt = DateTime.UtcNow;
        preset.UpdatedAt = DateTime.UtcNow;
        return await _presetRepository.AddAsync(preset);
    }

    public async Task<CalculationPreset> UpdatePresetAsync(CalculationPreset preset)
    {
        preset.UpdatedAt = DateTime.UtcNow;
        return await _presetRepository.UpdateAsync(preset);
    }

    public async Task<bool> DeletePresetAsync(int id)
    {
        return await _presetRepository.DeleteAsync(id);
    }
}

