using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public interface ITaxConfigService
{
    Task<IEnumerable<TaxConfig>> GetAllConfigsAsync();
    Task<TaxConfig?> GetConfigByIdAsync(int id);
    Task<TaxConfig?> GetDefaultConfigAsync();
    Task<IEnumerable<TaxConfig>> GetConfigsByCountryAsync(string countryCode);
    Task<TaxConfig> CreateConfigAsync(TaxConfig config);
    Task<TaxConfig> UpdateConfigAsync(TaxConfig config);
    Task<bool> DeleteConfigAsync(int id);
    Task<TaxConfig> SetDefaultConfigAsync(int id);
}

