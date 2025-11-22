namespace TaxCalculator.Domain.Entities;

public class TaxCalculationResult
{
    public decimal GrossIncome { get; set; }
    public decimal NetIncome { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalInsurance { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TaxableIncome { get; set; }
    
    // Breakdown
    public decimal IncomeTax { get; set; }
    public decimal SocialInsurance { get; set; }
    public decimal HealthInsurance { get; set; }
    public decimal UnemploymentInsurance { get; set; }
    public decimal PersonalDeduction { get; set; }
    public decimal DependentDeduction { get; set; }
    
    // Additional income breakdown
    public decimal FreelanceTax { get; set; }
    public decimal BonusTax { get; set; }
    public decimal OtherIncomeTax { get; set; }
    
    // Tax bracket breakdown
    public List<TaxBracketBreakdown> BracketBreakdown { get; set; } = new();
    
    // Metadata
    public string TaxConfigName { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}

public class TaxBracketBreakdown
{
    public decimal MinIncome { get; set; }
    public decimal? MaxIncome { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
}

