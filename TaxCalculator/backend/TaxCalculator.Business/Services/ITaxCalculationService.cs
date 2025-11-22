using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public interface ITaxCalculationService
{
    Task<TaxCalculationResult> CalculateGrossToNetAsync(
        decimal grossIncome,
        int taxConfigId,
        int numberOfDependents = 0,
        decimal freelanceIncome = 0,
        decimal bonusIncome = 0,
        decimal otherIncome = 0);

    Task<TaxCalculationResult> CalculateNetToGrossAsync(
        decimal netIncome,
        int taxConfigId,
        int numberOfDependents = 0,
        decimal freelanceIncome = 0,
        decimal bonusIncome = 0,
        decimal otherIncome = 0);

    Task<TaxCalculationResult> CompareTaxSystemsAsync(
        decimal grossIncome,
        List<int> taxConfigIds,
        int numberOfDependents = 0);
}

