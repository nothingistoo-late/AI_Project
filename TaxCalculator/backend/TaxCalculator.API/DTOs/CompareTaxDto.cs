using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class CompareTaxDto
{
    [Required]
    [Range(0, double.MaxValue)]
    public decimal GrossIncome { get; set; }
    
    [Required]
    [MinLength(1, ErrorMessage = "At least one tax config ID is required")]
    public List<int> TaxConfigIds { get; set; } = new();
    
    [Range(0, 100)]
    public int NumberOfDependents { get; set; } = 0;
}

