using Microsoft.EntityFrameworkCore;
using TaxCalculator.Data.Data;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public class TaxConfigRepository : Repository<TaxConfig>, ITaxConfigRepository
{
    public TaxConfigRepository(TaxCalculatorDbContext context) : base(context)
    {
    }

    public async Task<TaxConfig?> GetByIdWithBracketsAsync(int id)
    {
        return await _context.TaxConfigs
            .Include(tc => tc.TaxBrackets.OrderBy(tb => tb.MinIncome))
            .FirstOrDefaultAsync(tc => tc.Id == id);
    }

    public async Task<TaxConfig?> GetDefaultConfigAsync()
    {
        return await _context.TaxConfigs
            .Include(tc => tc.TaxBrackets.OrderBy(tb => tb.MinIncome))
            .FirstOrDefaultAsync(tc => tc.IsDefault && tc.IsActive);
    }

    public async Task<IEnumerable<TaxConfig>> GetByCountryCodeAsync(string countryCode)
    {
        return await _context.TaxConfigs
            .Include(tc => tc.TaxBrackets.OrderBy(tb => tb.MinIncome))
            .Where(tc => tc.CountryCode == countryCode && tc.IsActive)
            .ToListAsync();
    }

    public async Task<TaxConfig?> GetActiveConfigAsync(string countryCode)
    {
        return await _context.TaxConfigs
            .Include(tc => tc.TaxBrackets.OrderBy(tb => tb.MinIncome))
            .FirstOrDefaultAsync(tc => tc.CountryCode == countryCode && tc.IsActive);
    }
}

