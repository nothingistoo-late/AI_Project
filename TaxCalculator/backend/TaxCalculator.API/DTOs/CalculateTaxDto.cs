using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class CalculateTaxDto
{
    [Required]
    public int TaxConfigId { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Income must be positive")]
    public decimal Income { get; set; }
    
    [Required]
    public string Mode { get; set; } = "GrossToNet"; // GrossToNet or NetToGross
    
    [Range(0, 100, ErrorMessage = "Number of dependents must be between 0 and 100")]
    public int NumberOfDependents { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal FreelanceIncome { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal BonusIncome { get; set; } = 0;
    
    [Range(0, double.MaxValue)]
    public decimal OtherIncome { get; set; } = 0;
}

