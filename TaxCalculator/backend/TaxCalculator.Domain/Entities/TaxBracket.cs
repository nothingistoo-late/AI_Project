namespace TaxCalculator.Domain.Entities;

public class TaxBracket
{
    public int Id { get; set; }
    public int TaxConfigId { get; set; }
    public decimal MinIncome { get; set; }
    public decimal? MaxIncome { get; set; } // null means no upper limit
    public decimal Rate { get; set; } // Percentage (e.g., 10.5 for 10.5%)
    
    // Navigation property
    public TaxConfig? TaxConfig { get; set; }
}

