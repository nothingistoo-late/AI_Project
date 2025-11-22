using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.API.DTOs;

/// <summary>
/// DTO for uploading a track
/// </summary>
public class UploadTrackDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Artist { get; set; } = string.Empty;
    
    public string? Album { get; set; }
    
    public string? Genre { get; set; }
    
    public Guid? AlbumId { get; set; }
    
    public IFormFile? CoverImage { get; set; }
}

