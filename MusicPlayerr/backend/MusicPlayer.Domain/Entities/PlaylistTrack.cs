namespace MusicPlayer.Domain.Entities;

/// <summary>
/// Junction table for playlist-track many-to-many relationship
/// </summary>
public class PlaylistTrack
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PlaylistId { get; set; }
    
    public Guid TrackId { get; set; }
    
    public int Order { get; set; } // Order of track in playlist
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Playlist Playlist { get; set; } = null!;
    public virtual Track Track { get; set; } = null!;
}

