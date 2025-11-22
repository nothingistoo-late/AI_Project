namespace TaxCalculator.Domain.Entities;

public class TaxConfig
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CountryCode { get; set; } = "US"; // ISO country code
    public string Currency { get; set; } = "USD";
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    
    // Insurance rates (as percentages)
    public decimal SocialInsuranceRate { get; set; } = 0; // Social security, etc.
    public decimal HealthInsuranceRate { get; set; } = 0;
    public decimal UnemploymentInsuranceRate { get; set; } = 0;
    
    // Deductions
    public decimal PersonalDeduction { get; set; } = 0; // Standard personal deduction
    public decimal DependentDeduction { get; set; } = 0; // Per dependent
    
    // Additional settings
    public decimal MaxInsuranceBase { get; set; } = 0; // 0 means no limit
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<TaxBracket> TaxBrackets { get; set; } = new List<TaxBracket>();
    public ICollection<CalculationPreset> Presets { get; set; } = new List<CalculationPreset>();
}

