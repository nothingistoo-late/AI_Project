using Microsoft.AspNetCore.Mvc;
using TaxCalculator.API.DTOs;
using TaxCalculator.Business.Services;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExchangeRateController : ControllerBase
{
    private readonly IExchangeRateService _exchangeRateService;
    private readonly ILogger<ExchangeRateController> _logger;

    public ExchangeRateController(
        IExchangeRateService exchangeRateService,
        ILogger<ExchangeRateController> logger)
    {
        _exchangeRateService = exchangeRateService;
        _logger = logger;
    }

    [HttpPost("convert")]
    public async Task<ActionResult<object>> ConvertCurrency([FromBody] ConvertCurrencyDto dto)
    {
        try
        {
            var convertedAmount = await _exchangeRateService.ConvertCurrencyAsync(
                dto.Amount,
                dto.FromCurrency,
                dto.ToCurrency);

            // Get the rate (may be direct, reverse, or calculated)
            var rate = await _exchangeRateService.GetExchangeRateAsync(dto.FromCurrency, dto.ToCurrency);

            return Ok(new
            {
                originalAmount = dto.Amount,
                fromCurrency = dto.FromCurrency,
                convertedAmount = convertedAmount,
                toCurrency = dto.ToCurrency,
                exchangeRate = rate?.Rate,
                lastUpdated = rate?.LastUpdated,
                rateSource = rate?.Source,
                isReverseRate = rate?.Source?.Contains("reverse") == true || rate?.Source?.Contains("Cross-rate") == true
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting currency");
            return StatusCode(500, new { error = "An error occurred while converting currency." });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExchangeRate>>> GetAllRates()
    {
        try
        {
            var rates = await _exchangeRateService.GetAllRatesAsync();
            _logger.LogInformation($"Returning {rates.Count()} exchange rates");
            return Ok(rates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exchange rates");
            return StatusCode(500, new { error = "An error occurred while retrieving exchange rates." });
        }
    }

    [HttpGet("base/{baseCurrency}")]
    public async Task<ActionResult<IEnumerable<ExchangeRate>>> GetRatesByBaseCurrency(string baseCurrency)
    {
        try
        {
            var rates = await _exchangeRateService.GetRatesByBaseCurrencyAsync(baseCurrency);
            return Ok(rates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exchange rates by base currency");
            return StatusCode(500, new { error = "An error occurred while retrieving exchange rates." });
        }
    }

    [HttpGet("{fromCurrency}/{toCurrency}")]
    public async Task<ActionResult<ExchangeRate>> GetRate(string fromCurrency, string toCurrency)
    {
        try
        {
            var rate = await _exchangeRateService.GetExchangeRateAsync(fromCurrency, toCurrency);
            if (rate == null)
                return NotFound(new { error = $"Exchange rate not found for {fromCurrency} to {toCurrency}" });

            return Ok(rate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting exchange rate");
            return StatusCode(500, new { error = "An error occurred while retrieving the exchange rate." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExchangeRate>> CreateOrUpdateRate([FromBody] CreateExchangeRateDto dto)
    {
        try
        {
            var rate = await _exchangeRateService.CreateOrUpdateRateAsync(
                dto.FromCurrency,
                dto.ToCurrency,
                dto.Rate,
                dto.Source);

            return Ok(rate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating exchange rate");
            return StatusCode(500, new { error = "An error occurred while saving the exchange rate." });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult> RefreshRates()
    {
        try
        {
            await _exchangeRateService.RefreshRatesAsync();
            return Ok(new { message = "Exchange rates refreshed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing exchange rates");
            return StatusCode(500, new { error = "An error occurred while refreshing exchange rates." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRate(int id)
    {
        try
        {
            var deleted = await _exchangeRateService.DeleteRateAsync(id);
            if (!deleted)
                return NotFound(new { error = $"Exchange rate with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting exchange rate");
            return StatusCode(500, new { error = "An error occurred while deleting the exchange rate." });
        }
    }
}

