using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public interface IPresetService
{
    Task<IEnumerable<CalculationPreset>> GetAllPresetsAsync();
    Task<CalculationPreset?> GetPresetByIdAsync(int id);
    Task<IEnumerable<CalculationPreset>> GetPresetsByConfigIdAsync(int taxConfigId);
    Task<CalculationPreset> CreatePresetAsync(CalculationPreset preset);
    Task<CalculationPreset> UpdatePresetAsync(CalculationPreset preset);
    Task<bool> DeletePresetAsync(int id);
}

