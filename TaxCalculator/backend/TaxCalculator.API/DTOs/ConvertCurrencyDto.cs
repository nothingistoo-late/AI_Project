using System.ComponentModel.DataAnnotations;

namespace TaxCalculator.API.DTOs;

public class ConvertCurrencyDto
{
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Amount must be positive")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string FromCurrency { get; set; } = string.Empty;
    
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string ToCurrency { get; set; } = string.Empty;
}

