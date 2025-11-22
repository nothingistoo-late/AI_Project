using TaxCalculator.Data.Repositories;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public class ExchangeRateService : IExchangeRateService
{
    private readonly IExchangeRateRepository _exchangeRateRepository;

    public ExchangeRateService(IExchangeRateRepository exchangeRateRepository)
    {
        _exchangeRateRepository = exchangeRateRepository;
    }

    public async Task<decimal> ConvertCurrencyAsync(decimal amount, string fromCurrency, string toCurrency)
    {
        if (fromCurrency.ToUpper() == toCurrency.ToUpper())
            return amount;

        // Try direct rate
        var rate = await _exchangeRateRepository.GetRateAsync(fromCurrency, toCurrency);
        if (rate != null)
            return amount * rate.Rate;

        // Try reverse rate (bidirectional conversion)
        var reverseRate = await _exchangeRateRepository.GetRateAsync(toCurrency, fromCurrency);
        if (reverseRate != null)
            return amount / reverseRate.Rate;

        // Try through USD as base currency (common practice)
        // Try all combinations: fromCurrency <-> USD <-> toCurrency
        var fromToUsd = await _exchangeRateRepository.GetRateAsync(fromCurrency, "USD");
        var usdToFrom = await _exchangeRateRepository.GetRateAsync("USD", fromCurrency);
        var usdToTo = await _exchangeRateRepository.GetRateAsync("USD", toCurrency);
        var toToUsd = await _exchangeRateRepository.GetRateAsync(toCurrency, "USD");
        
        // Case 1: fromCurrency -> USD -> toCurrency
        if (fromToUsd != null && usdToTo != null)
        {
            var usdAmount = amount * fromToUsd.Rate; // Convert fromCurrency to USD
            return usdAmount * usdToTo.Rate; // Convert USD to toCurrency
        }
        
        // Case 2: fromCurrency <- USD -> toCurrency (fromCurrency to USD via reverse, USD to toCurrency direct)
        if (usdToFrom != null && usdToTo != null)
        {
            var usdAmount = amount / usdToFrom.Rate; // Convert fromCurrency to USD (using reverse rate)
            return usdAmount * usdToTo.Rate; // Convert USD to toCurrency
        }
        
        // Case 3: fromCurrency -> USD <- toCurrency (fromCurrency to USD direct, toCurrency to USD via reverse)
        if (fromToUsd != null && toToUsd != null)
        {
            var usdAmount = amount * fromToUsd.Rate; // Convert fromCurrency to USD
            return usdAmount / toToUsd.Rate; // Convert USD to toCurrency (using reverse rate)
        }
        
        // Case 4: fromCurrency <- USD <- toCurrency (both via reverse)
        if (usdToFrom != null && toToUsd != null)
        {
            var usdAmount = amount / usdToFrom.Rate; // Convert fromCurrency to USD (using reverse)
            return usdAmount / toToUsd.Rate; // Convert USD to toCurrency (using reverse)
        }

        throw new ArgumentException($"Exchange rate not found for {fromCurrency} to {toCurrency}. Please add the exchange rate or ensure reverse rate exists.");
    }

    public async Task<ExchangeRate?> GetExchangeRateAsync(string fromCurrency, string toCurrency)
    {
        // Try direct rate first
        var directRate = await _exchangeRateRepository.GetRateAsync(fromCurrency, toCurrency);
        if (directRate != null)
            return directRate;

        // Try reverse rate and create a virtual rate object
        var reverseRate = await _exchangeRateRepository.GetRateAsync(toCurrency, fromCurrency);
        if (reverseRate != null)
        {
            // Return a virtual rate object representing the reverse conversion
            return new ExchangeRate
            {
                Id = reverseRate.Id, // Keep original ID for reference
                FromCurrency = fromCurrency.ToUpper(),
                ToCurrency = toCurrency.ToUpper(),
                Rate = 1m / reverseRate.Rate, // Calculate reverse rate
                LastUpdated = reverseRate.LastUpdated,
                Source = reverseRate.Source + " (reverse)",
                IsActive = reverseRate.IsActive
            };
        }

        // Try through USD as intermediate (bidirectional)
        if (fromCurrency.ToUpper() != "USD" && toCurrency.ToUpper() != "USD")
        {
            var fromToUsd = await _exchangeRateRepository.GetRateAsync(fromCurrency, "USD");
            var usdToFrom = await _exchangeRateRepository.GetRateAsync("USD", fromCurrency);
            var usdToTo = await _exchangeRateRepository.GetRateAsync("USD", toCurrency);
            var toToUsd = await _exchangeRateRepository.GetRateAsync(toCurrency, "USD");
            
            decimal? crossRate = null;
            
            // Try all combinations to calculate cross rate
            if (fromToUsd != null && usdToTo != null)
            {
                crossRate = fromToUsd.Rate * usdToTo.Rate;
            }
            else if (usdToFrom != null && usdToTo != null)
            {
                crossRate = (1m / usdToFrom.Rate) * usdToTo.Rate;
            }
            else if (fromToUsd != null && toToUsd != null)
            {
                crossRate = fromToUsd.Rate / toToUsd.Rate;
            }
            else if (usdToFrom != null && toToUsd != null)
            {
                crossRate = (1m / usdToFrom.Rate) / toToUsd.Rate;
            }
            
            if (crossRate.HasValue)
            {
                return new ExchangeRate
                {
                    FromCurrency = fromCurrency.ToUpper(),
                    ToCurrency = toCurrency.ToUpper(),
                    Rate = crossRate.Value,
                    LastUpdated = DateTime.UtcNow,
                    Source = "Cross-rate via USD",
                    IsActive = true
                };
            }
        }

        return null;
    }

    public async Task<IEnumerable<ExchangeRate>> GetAllRatesAsync()
    {
        return await _exchangeRateRepository.GetAllActiveRatesAsync();
    }

    public async Task<IEnumerable<ExchangeRate>> GetRatesByBaseCurrencyAsync(string baseCurrency)
    {
        return await _exchangeRateRepository.GetRatesByBaseCurrencyAsync(baseCurrency);
    }

    public async Task<ExchangeRate> CreateOrUpdateRateAsync(string fromCurrency, string toCurrency, decimal rate, string? source = null)
    {
        var existing = await _exchangeRateRepository.GetRateAsync(fromCurrency, toCurrency);
        
        if (existing != null)
        {
            existing.Rate = rate;
            existing.LastUpdated = DateTime.UtcNow;
            if (source != null) existing.Source = source;
            return await _exchangeRateRepository.UpdateAsync(existing);
        }
        else
        {
            var newRate = new ExchangeRate
            {
                FromCurrency = fromCurrency.ToUpper(),
                ToCurrency = toCurrency.ToUpper(),
                Rate = rate,
                LastUpdated = DateTime.UtcNow,
                Source = source ?? "Manual",
                IsActive = true
            };
            return await _exchangeRateRepository.AddAsync(newRate);
        }
    }

    public async Task<bool> DeleteRateAsync(int id)
    {
        return await _exchangeRateRepository.DeleteAsync(id);
    }

    public async Task RefreshRatesAsync()
    {
        // This can be extended to fetch from external APIs like exchangerate-api.com, fixer.io, etc.
        // For now, we'll use some common rates as defaults
        
        var commonRates = new Dictionary<(string, string), decimal>
        {
            { ("USD", "VND"), 24500m },
            { ("USD", "EUR"), 0.92m },
            { ("USD", "GBP"), 0.79m },
            { ("USD", "JPY"), 150m },
            { ("USD", "CNY"), 7.2m },
            { ("EUR", "VND"), 26600m },
            { ("EUR", "USD"), 1.09m },
            { ("VND", "USD"), 0.000041m },
        };

        foreach (var ((from, to), rate) in commonRates)
        {
            await CreateOrUpdateRateAsync(from, to, rate, "Default");
        }
    }
}

