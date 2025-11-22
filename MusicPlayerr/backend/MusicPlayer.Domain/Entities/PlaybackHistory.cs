namespace MusicPlayer.Domain.Entities;

/// <summary>
/// User playback history for tracking recently played tracks
/// </summary>
public class PlaybackHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public Guid TrackId { get; set; }
    
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Track Track { get; set; } = null!;
}

