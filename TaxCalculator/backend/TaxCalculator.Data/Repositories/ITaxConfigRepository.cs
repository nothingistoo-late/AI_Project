using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public interface ITaxConfigRepository : IRepository<TaxConfig>
{
    Task<TaxConfig?> GetByIdWithBracketsAsync(int id);
    Task<TaxConfig?> GetDefaultConfigAsync();
    Task<IEnumerable<TaxConfig>> GetByCountryCodeAsync(string countryCode);
    Task<TaxConfig?> GetActiveConfigAsync(string countryCode);
}

