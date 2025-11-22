using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.API.DTOs;

/// <summary>
/// DTO for updating a track
/// </summary>
public class UpdateTrackDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Artist { get; set; } = string.Empty;
    
    public string? Album { get; set; }
    
    public string? Genre { get; set; }
    
    public IFormFile? CoverImage { get; set; }
}


