using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class CreateTaxConfigDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(3)]
    public string CountryCode { get; set; } = "US";
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [Range(0, 100)]
    public decimal SocialInsuranceRate { get; set; } = 0;
    
    [Range(0, 100)]
    public decimal HealthInsuranceRate { get; set; } = 0;
    
    [Range(0, 100)]
    public decimal UnemploymentInsuranceRate { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal PersonalDeduction { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal DependentDeduction { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal MaxInsuranceBase { get; set; } = 0;
    
    public string? Notes { get; set; }
    
    public bool IsDefault { get; set; } = false;
    
    public List<CreateTaxBracketDto> TaxBrackets { get; set; } = new();
}

public class CreateTaxBracketDto
{
    [Required]
    [Range(0, double.MaxValue)]
    public decimal MinIncome { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? MaxIncome { get; set; }
    
    [Required]
    [Range(0, 100)]
    public decimal Rate { get; set; }
}

