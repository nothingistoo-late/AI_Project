namespace TaxCalculator.Domain.Entities;

public class CalculationPreset
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TaxConfigId { get; set; }
    
    // Calculation inputs
    public decimal GrossIncome { get; set; }
    public decimal NetIncome { get; set; }
    public int NumberOfDependents { get; set; } = 0;
    public string CalculationMode { get; set; } = "GrossToNet"; // GrossToNet, NetToGross
    
    // Additional income
    public decimal FreelanceIncome { get; set; } = 0;
    public decimal BonusIncome { get; set; } = 0;
    public decimal OtherIncome { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public TaxConfig? TaxConfig { get; set; }
}

