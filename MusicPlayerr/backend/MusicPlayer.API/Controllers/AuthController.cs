using Microsoft.AspNetCore.Mvc;
using MusicPlayer.API.DTOs;
using MusicPlayer.Business.Services;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for user authentication
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto.Username, registerDto.Email, registerDto.Password);

        if (result == null)
        {
            return BadRequest(new { message = "Username or email already exists" });
        }

        return Ok(new AuthResponseDto
        {
            Token = result.Token,
            Username = result.Username,
            Email = result.Email,
            Role = result.Role
        });
    }

    /// <summary>
    /// Login user
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

        if (result == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        return Ok(new AuthResponseDto
        {
            Token = result.Token,
            Username = result.Username,
            Email = result.Email,
            Role = result.Role
        });
    }
}


