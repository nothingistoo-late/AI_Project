using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.Business.Services;
using System.Security.Claims;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for user playback history (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly IHistoryService _historyService;

    public HistoryController(IHistoryService historyService)
    {
        _historyService = historyService;
    }

    /// <summary>
    /// Get user's playback history
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetHistory([FromQuery] int limit = 50)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var history = await _historyService.GetUserHistoryAsync(userId, limit);
        return Ok(history);
    }

    /// <summary>
    /// Get recently played tracks
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentTracks([FromQuery] int limit = 20)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var tracks = await _historyService.GetRecentTracksAsync(userId, limit);
        return Ok(tracks);
    }
}
