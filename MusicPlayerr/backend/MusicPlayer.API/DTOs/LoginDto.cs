using System.ComponentModel.DataAnnotations;

namespace MusicPlayer.API.DTOs;

/// <summary>
/// DTO for user login
/// </summary>
public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}


