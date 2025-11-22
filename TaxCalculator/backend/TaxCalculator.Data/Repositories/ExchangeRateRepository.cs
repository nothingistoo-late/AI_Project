using Microsoft.EntityFrameworkCore;
using TaxCalculator.Data.Data;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Repositories;

public class ExchangeRateRepository : Repository<ExchangeRate>, IExchangeRateRepository
{
    public ExchangeRateRepository(TaxCalculatorDbContext context) : base(context)
    {
    }

    public async Task<ExchangeRate?> GetRateAsync(string fromCurrency, string toCurrency)
    {
        return await _context.ExchangeRates
            .Where(er => er.FromCurrency == fromCurrency.ToUpper() 
                      && er.ToCurrency == toCurrency.ToUpper() 
                      && er.IsActive)
            .OrderByDescending(er => er.LastUpdated)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ExchangeRate>> GetRatesByBaseCurrencyAsync(string baseCurrency)
    {
        return await _context.ExchangeRates
            .Where(er => er.FromCurrency == baseCurrency.ToUpper() && er.IsActive)
            .OrderBy(er => er.ToCurrency)
            .ToListAsync();
    }

    public async Task<IEnumerable<ExchangeRate>> GetAllActiveRatesAsync()
    {
        return await _context.ExchangeRates
            .Where(er => er.IsActive)
            .OrderBy(er => er.FromCurrency)
            .ThenBy(er => er.ToCurrency)
            .ToListAsync();
    }

    public async Task<ExchangeRate?> GetLatestRateAsync(string fromCurrency, string toCurrency)
    {
        return await _context.ExchangeRates
            .Where(er => er.FromCurrency == fromCurrency.ToUpper() 
                      && er.ToCurrency == toCurrency.ToUpper() 
                      && er.IsActive)
            .OrderByDescending(er => er.LastUpdated)
            .FirstOrDefaultAsync();
    }
}

