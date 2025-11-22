using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public interface IExchangeRateRepository : IRepository<ExchangeRate>
{
    Task<ExchangeRate?> GetRateAsync(string fromCurrency, string toCurrency);
    Task<IEnumerable<ExchangeRate>> GetRatesByBaseCurrencyAsync(string baseCurrency);
    Task<IEnumerable<ExchangeRate>> GetAllActiveRatesAsync();
    Task<ExchangeRate?> GetLatestRateAsync(string fromCurrency, string toCurrency);
}

