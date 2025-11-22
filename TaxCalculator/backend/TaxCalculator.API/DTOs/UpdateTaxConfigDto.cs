using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class UpdateTaxConfigDto
{
    [StringLength(200)]
    public string? Name { get; set; }
    
    [StringLength(3)]
    public string? CountryCode { get; set; }
    
    [StringLength(3)]
    public string? Currency { get; set; }
    
    [Range(0, 100)]
    public decimal? SocialInsuranceRate { get; set; }
    
    [Range(0, 100)]
    public decimal? HealthInsuranceRate { get; set; }
    
    [Range(0, 100)]
    public decimal? UnemploymentInsuranceRate { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? PersonalDeduction { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? DependentDeduction { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal? MaxInsuranceBase { get; set; }
    
    public string? Notes { get; set; }
    
    public bool? IsActive { get; set; }
    
    public bool? IsDefault { get; set; }
}

