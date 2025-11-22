using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public interface IPresetRepository : IRepository<CalculationPreset>
{
    Task<IEnumerable<CalculationPreset>> GetByTaxConfigIdAsync(int taxConfigId);
}

