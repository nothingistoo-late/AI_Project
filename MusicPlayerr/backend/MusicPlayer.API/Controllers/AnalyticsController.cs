using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.Business.Services;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for admin analytics (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Get top tracks by play count
    /// </summary>
    [HttpGet("top-tracks")]
    public async Task<IActionResult> GetTopTracks([FromQuery] int limit = 10)
    {
        var tracks = await _analyticsService.GetTopTracksAsync(limit);
        return Ok(tracks);
    }

    /// <summary>
    /// Get top albums by track count
    /// </summary>
    [HttpGet("top-albums")]
    public async Task<IActionResult> GetTopAlbums([FromQuery] int limit = 10)
    {
        var albums = await _analyticsService.GetTopAlbumsAsync(limit);
        return Ok(albums);
    }

    /// <summary>
    /// Get recently uploaded tracks
    /// </summary>
    [HttpGet("recent-uploads")]
    public async Task<IActionResult> GetRecentUploads([FromQuery] int limit = 10)
    {
        var tracks = await _analyticsService.GetRecentUploadsAsync(limit);
        return Ok(tracks);
    }

    /// <summary>
    /// Get user statistics
    /// </summary>
    [HttpGet("user-stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var stats = await _analyticsService.GetUserStatsAsync();
        return Ok(stats);
    }
}
