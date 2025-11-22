using TaxCalculator.Data.Repositories;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Business.Services;

public class TaxCalculationService : ITaxCalculationService
{
    private readonly ITaxConfigRepository _taxConfigRepository;

    public TaxCalculationService(ITaxConfigRepository taxConfigRepository)
    {
        _taxConfigRepository = taxConfigRepository;
    }

    public async Task<TaxCalculationResult> CalculateGrossToNetAsync(
        decimal grossIncome,
        int taxConfigId,
        int numberOfDependents = 0,
        decimal freelanceIncome = 0,
        decimal bonusIncome = 0,
        decimal otherIncome = 0)
    {
        var taxConfig = await _taxConfigRepository.GetByIdWithBracketsAsync(taxConfigId);
        if (taxConfig == null)
            throw new ArgumentException($"Tax configuration with ID {taxConfigId} not found.");

        return CalculateGrossToNet(grossIncome, taxConfig, numberOfDependents, freelanceIncome, bonusIncome, otherIncome);
    }

    public async Task<TaxCalculationResult> CalculateNetToGrossAsync(
        decimal netIncome,
        int taxConfigId,
        int numberOfDependents = 0,
        decimal freelanceIncome = 0,
        decimal bonusIncome = 0,
        decimal otherIncome = 0)
    {
        var taxConfig = await _taxConfigRepository.GetByIdWithBracketsAsync(taxConfigId);
        if (taxConfig == null)
            throw new ArgumentException($"Tax configuration with ID {taxConfigId} not found.");

        // Use iterative approach to find gross income
        decimal grossIncome = netIncome;
        decimal tolerance = 0.01m;
        int maxIterations = 100;
        int iteration = 0;

        while (iteration < maxIterations)
        {
            var result = CalculateGrossToNet(grossIncome, taxConfig, numberOfDependents, freelanceIncome, bonusIncome, otherIncome);
            decimal difference = result.NetIncome - netIncome;

            if (Math.Abs(difference) < tolerance)
                return result;

            // Adjust gross income (simple linear approximation)
            grossIncome = grossIncome - difference * 1.2m; // 1.2 is an approximation factor
            iteration++;
        }

        // If iteration didn't converge, return the last calculation
        return CalculateGrossToNet(grossIncome, taxConfig, numberOfDependents, freelanceIncome, bonusIncome, otherIncome);
    }

    public async Task<TaxCalculationResult> CompareTaxSystemsAsync(
        decimal grossIncome,
        List<int> taxConfigIds,
        int numberOfDependents = 0)
    {
        // For comparison, we'll use the first config as the base
        // In a real scenario, you might want to return multiple results
        if (taxConfigIds.Count == 0)
            throw new ArgumentException("At least one tax config ID is required.");

        return await CalculateGrossToNetAsync(grossIncome, taxConfigIds[0], numberOfDependents);
    }

    private TaxCalculationResult CalculateGrossToNet(
        decimal grossIncome,
        TaxConfig taxConfig,
        int numberOfDependents,
        decimal freelanceIncome,
        decimal bonusIncome,
        decimal otherIncome)
    {
        var result = new TaxCalculationResult
        {
            GrossIncome = grossIncome,
            TaxConfigName = taxConfig.Name,
            Currency = taxConfig.Currency
        };

        // Calculate insurance contributions
        decimal insuranceBase = grossIncome;
        if (taxConfig.MaxInsuranceBase > 0 && insuranceBase > taxConfig.MaxInsuranceBase)
        {
            insuranceBase = taxConfig.MaxInsuranceBase;
        }

        result.SocialInsurance = insuranceBase * (taxConfig.SocialInsuranceRate / 100m);
        result.HealthInsurance = insuranceBase * (taxConfig.HealthInsuranceRate / 100m);
        result.UnemploymentInsurance = insuranceBase * (taxConfig.UnemploymentInsuranceRate / 100m);
        result.TotalInsurance = result.SocialInsurance + result.HealthInsurance + result.UnemploymentInsurance;

        // Calculate deductions
        result.PersonalDeduction = taxConfig.PersonalDeduction;
        result.DependentDeduction = taxConfig.DependentDeduction * numberOfDependents;
        result.TotalDeductions = result.PersonalDeduction + result.DependentDeduction;

        // Calculate taxable income
        result.TaxableIncome = grossIncome - result.TotalInsurance - result.TotalDeductions;
        if (result.TaxableIncome < 0) result.TaxableIncome = 0;

        // Calculate income tax using brackets
        result.IncomeTax = CalculateTaxByBrackets(result.TaxableIncome, taxConfig.TaxBrackets, result.BracketBreakdown);

        // Calculate additional income taxes (simplified - can be enhanced)
        result.FreelanceTax = freelanceIncome > 0 ? freelanceIncome * 0.15m : 0; // 15% flat rate example
        result.BonusTax = bonusIncome > 0 ? CalculateTaxByBrackets(bonusIncome, taxConfig.TaxBrackets, new List<TaxBracketBreakdown>()) : 0;
        result.OtherIncomeTax = otherIncome > 0 ? otherIncome * 0.10m : 0; // 10% flat rate example

        result.TotalTax = result.IncomeTax + result.FreelanceTax + result.BonusTax + result.OtherIncomeTax;

        // Calculate net income
        result.NetIncome = grossIncome - result.TotalInsurance - result.TotalTax + freelanceIncome + bonusIncome + otherIncome - result.FreelanceTax - result.BonusTax - result.OtherIncomeTax;

        return result;
    }

    private decimal CalculateTaxByBrackets(decimal taxableIncome, ICollection<TaxBracket> brackets, List<TaxBracketBreakdown> breakdown)
    {
        if (brackets == null || !brackets.Any())
            return 0;

        decimal totalTax = 0;
        var sortedBrackets = brackets.OrderBy(b => b.MinIncome).ToList();

        foreach (var bracket in sortedBrackets)
        {
            if (taxableIncome <= bracket.MinIncome)
                break;

            decimal bracketMax = bracket.MaxIncome ?? decimal.MaxValue;
            decimal taxableInBracket = Math.Min(taxableIncome, bracketMax) - bracket.MinIncome;

            if (taxableInBracket > 0)
            {
                decimal taxInBracket = taxableInBracket * (bracket.Rate / 100m);
                totalTax += taxInBracket;

                breakdown.Add(new TaxBracketBreakdown
                {
                    MinIncome = bracket.MinIncome,
                    MaxIncome = bracket.MaxIncome,
                    Rate = bracket.Rate,
                    TaxableAmount = taxableInBracket,
                    TaxAmount = taxInBracket
                });
            }
        }

        return totalTax;
    }
}

