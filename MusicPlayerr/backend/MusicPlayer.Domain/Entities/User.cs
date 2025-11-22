using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.Domain.Entities;

/// <summary>
/// User model for authentication and authorization
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public string Role { get; set; } = "User"; // User, Admin
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    public virtual ICollection<PlaybackHistory> PlaybackHistory { get; set; } = new List<PlaybackHistory>();
}

