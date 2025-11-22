using TaxCalculator.Data.Repositories;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public class TaxConfigService : ITaxConfigService
{
    private readonly ITaxConfigRepository _taxConfigRepository;

    public TaxConfigService(ITaxConfigRepository taxConfigRepository)
    {
        _taxConfigRepository = taxConfigRepository;
    }

    public async Task<IEnumerable<TaxConfig>> GetAllConfigsAsync()
    {
        return await _taxConfigRepository.GetAllAsync();
    }

    public async Task<TaxConfig?> GetConfigByIdAsync(int id)
    {
        return await _taxConfigRepository.GetByIdWithBracketsAsync(id);
    }

    public async Task<TaxConfig?> GetDefaultConfigAsync()
    {
        return await _taxConfigRepository.GetDefaultConfigAsync();
    }

    public async Task<IEnumerable<TaxConfig>> GetConfigsByCountryAsync(string countryCode)
    {
        return await _taxConfigRepository.GetByCountryCodeAsync(countryCode);
    }

    public async Task<TaxConfig> CreateConfigAsync(TaxConfig config)
    {
        config.CreatedAt = DateTime.UtcNow;
        config.UpdatedAt = DateTime.UtcNow;
        return await _taxConfigRepository.AddAsync(config);
    }

    public async Task<TaxConfig> UpdateConfigAsync(TaxConfig config)
    {
        config.UpdatedAt = DateTime.UtcNow;
        return await _taxConfigRepository.UpdateAsync(config);
    }

    public async Task<bool> DeleteConfigAsync(int id)
    {
        return await _taxConfigRepository.DeleteAsync(id);
    }

    public async Task<TaxConfig> SetDefaultConfigAsync(int id)
    {
        // Remove default flag from all configs
        var allConfigs = await _taxConfigRepository.GetAllAsync();
        foreach (var config in allConfigs)
        {
            if (config.IsDefault && config.Id != id)
            {
                config.IsDefault = false;
                await _taxConfigRepository.UpdateAsync(config);
            }
        }

        // Set the new default
        var targetConfig = await _taxConfigRepository.GetByIdAsync(id);
        if (targetConfig == null)
            throw new ArgumentException($"Tax configuration with ID {id} not found.");

        targetConfig.IsDefault = true;
        return await _taxConfigRepository.UpdateAsync(targetConfig);
    }
}

