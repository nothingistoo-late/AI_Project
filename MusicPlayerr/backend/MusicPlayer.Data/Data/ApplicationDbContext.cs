using Microsoft.EntityFrameworkCore;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Data;

/// <summary>
/// Entity Framework database context
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Track> Tracks { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
    public DbSet<PlaybackHistory> PlaybackHistory { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Track configuration
        modelBuilder.Entity<Track>(entity =>
        {
            entity.HasOne(t => t.AlbumNavigation)
                .WithMany(a => a.Tracks)
                .HasForeignKey(t => t.AlbumId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // PlaylistTrack configuration
        modelBuilder.Entity<PlaylistTrack>(entity =>
        {
            entity.HasOne(pt => pt.Playlist)
                .WithMany(p => p.PlaylistTracks)
                .HasForeignKey(pt => pt.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pt => pt.Track)
                .WithMany(t => t.PlaylistTracks)
                .HasForeignKey(pt => pt.TrackId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(pt => new { pt.PlaylistId, pt.TrackId });
        });

        // PlaybackHistory configuration
        modelBuilder.Entity<PlaybackHistory>(entity =>
        {
            entity.HasOne(ph => ph.User)
                .WithMany(u => u.PlaybackHistory)
                .HasForeignKey(ph => ph.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ph => ph.Track)
                .WithMany(t => t.PlaybackHistory)
                .HasForeignKey(ph => ph.TrackId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

