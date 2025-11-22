using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.Business.Services;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for search and filtering (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    /// <summary>
    /// Search tracks, albums, and playlists
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { message = "Search query is required" });
        }

        var (tracks, albums) = await _searchService.SearchAsync(q);
        return Ok(new { tracks, albums });
    }

    /// <summary>
    /// Get all available genres
    /// </summary>
    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _searchService.GetGenresAsync();
        return Ok(genres);
    }
}
