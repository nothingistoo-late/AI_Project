using Microsoft.EntityFrameworkCore;
using TaxCalculator.Data.Data;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public class PresetRepository : Repository<CalculationPreset>, IPresetRepository
{
    public PresetRepository(TaxCalculatorDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CalculationPreset>> GetByTaxConfigIdAsync(int taxConfigId)
    {
        return await _dbSet
            .Where(p => p.TaxConfigId == taxConfigId)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
    }
}

