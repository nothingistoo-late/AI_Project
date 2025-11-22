using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.API.DTOs;

/// <summary>
/// DTO for creating a new playlist
/// </summary>
public class CreatePlaylistDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
}


