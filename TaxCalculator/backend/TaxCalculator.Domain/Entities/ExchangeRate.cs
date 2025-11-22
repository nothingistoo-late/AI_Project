namespace TaxCalculator.Domain.Entities;

public class ExchangeRate
{
    public int Id { get; set; }
    public string FromCurrency { get; set; } = string.Empty; // ISO currency code (e.g., USD)
    public string ToCurrency { get; set; } = string.Empty; // ISO currency code (e.g., VND)
    public decimal Rate { get; set; } // Exchange rate (1 FromCurrency = Rate ToCurrency)
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public string? Source { get; set; } // API source or "Manual"
    public bool IsActive { get; set; } = true;
}

