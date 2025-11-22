using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class CreatePresetDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int TaxConfigId { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal GrossIncome { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal NetIncome { get; set; } = 0;
    
    [Range(0, 100)]
    public int NumberOfDependents { get; set; } = 0;
    
    [Required]
    public string CalculationMode { get; set; } = "GrossToNet";
    
    [Range(0, double.MaxValue)]
    public decimal FreelanceIncome { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal BonusIncome { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal OtherIncome { get; set; } = 0;
}

