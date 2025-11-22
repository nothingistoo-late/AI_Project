using Microsoft.EntityFrameworkCore;
using TaxCalculator.Domain.Entities;

namespace TaxCalculator.Data.Data;

public class TaxCalculatorDbContext : DbContext
{
    public TaxCalculatorDbContext(DbContextOptions<TaxCalculatorDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaxConfig> TaxConfigs { get; set; }
    public DbSet<TaxBracket> TaxBrackets { get; set; }
    public DbSet<CalculationPreset> CalculationPresets { get; set; }
    public DbSet<ExchangeRate> ExchangeRates { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TaxConfig
        modelBuilder.Entity<TaxConfig>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CountryCode).HasMaxLength(3);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.HasIndex(e => e.CountryCode);
        });

        // TaxBracket
        modelBuilder.Entity<TaxBracket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.TaxConfig)
                  .WithMany(tc => tc.TaxBrackets)
                  .HasForeignKey(e => e.TaxConfigId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CalculationPreset
        modelBuilder.Entity<CalculationPreset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CalculationMode).HasMaxLength(50);
            entity.HasOne(e => e.TaxConfig)
                  .WithMany(tc => tc.Presets)
                  .HasForeignKey(e => e.TaxConfigId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ExchangeRate
        modelBuilder.Entity<ExchangeRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FromCurrency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.ToCurrency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.Source).HasMaxLength(100);
            entity.HasIndex(e => new { e.FromCurrency, e.ToCurrency });
        });
    }
}

