using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.API.DTOs;

/// <summary>
/// DTO for updating an album
/// </summary>
public class UpdateAlbumDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Artist { get; set; } = string.Empty;
    
    public string? Genre { get; set; }
    
    public IFormFile? CoverImage { get; set; }
}


