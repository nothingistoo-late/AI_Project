using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class CreateExchangeRateDto
{
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string FromCurrency { get; set; } = string.Empty;
    
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string ToCurrency { get; set; } = string.Empty;
    
    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Rate must be positive")]
    public decimal Rate { get; set; }
    
    public string? Source { get; set; }
}

