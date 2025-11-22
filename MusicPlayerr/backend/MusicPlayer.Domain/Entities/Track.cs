using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.Domain.Entities;

/// <summary>
/// Music track model with metadata
/// </summary>
public class Track
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Artist { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Album { get; set; }
    
    public Guid? AlbumId { get; set; }
    
    [MaxLength(50)]
    public string? Genre { get; set; }
    
    public int Duration { get; set; } // Duration in seconds
    
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? CoverImagePath { get; set; }
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    public int PlayCount { get; set; } = 0;
    
    // Navigation properties
    public virtual Album? AlbumNavigation { get; set; }
    public virtual ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
    public virtual ICollection<PlaybackHistory> PlaybackHistory { get; set; } = new List<PlaybackHistory>();
}

