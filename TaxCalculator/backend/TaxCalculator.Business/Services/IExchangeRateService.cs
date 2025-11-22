using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public interface IExchangeRateService
{
    Task<decimal> ConvertCurrencyAsync(decimal amount, string fromCurrency, string toCurrency);
    Task<ExchangeRate?> GetExchangeRateAsync(string fromCurrency, string toCurrency);
    Task<IEnumerable<ExchangeRate>> GetAllRatesAsync();
    Task<IEnumerable<ExchangeRate>> GetRatesByBaseCurrencyAsync(string baseCurrency);
    Task<ExchangeRate> CreateOrUpdateRateAsync(string fromCurrency, string toCurrency, decimal rate, string? source = null);
    Task<bool> DeleteRateAsync(int id);
    Task RefreshRatesAsync(); // Fetch from external API if available
}

