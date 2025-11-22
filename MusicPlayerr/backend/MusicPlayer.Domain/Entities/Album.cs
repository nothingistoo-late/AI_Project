using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.Domain.Entities;

/// <summary>
/// Album model for grouping tracks
/// </summary>
public class Album
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Artist { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Genre { get; set; }
    
    [MaxLength(500)]
    public string? CoverImagePath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<Track> Tracks { get; set; } = new List<Track>();
}

