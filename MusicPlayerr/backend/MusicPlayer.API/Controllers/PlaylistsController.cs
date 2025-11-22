using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.API.DTOs;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Business.Services;
using System.Security.Claims;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for playlist management (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : ControllerBase
{
    private readonly IPlaylistService _playlistService;

    public PlaylistsController(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    /// <summary>
    /// Get all playlists for current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPlaylists()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var playlists = await _playlistService.GetUserPlaylistsAsync(userId);
        return Ok(playlists);
    }

    /// <summary>
    /// Get playlist by ID with tracks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlaylist(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var playlist = await _playlistService.GetPlaylistByIdAsync(id, userId);
        if (playlist == null)
        {
            return NotFound();
        }
        return Ok(playlist);
    }

    /// <summary>
    /// Create a new playlist
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePlaylist([FromBody] CreatePlaylistDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        
        var playlist = new Playlist
        {
            Name = dto.Name,
            Description = dto.Description
        };
        
        var createdPlaylist = await _playlistService.CreatePlaylistAsync(playlist, userId);
        return CreatedAtAction(nameof(GetPlaylist), new { id = createdPlaylist.Id }, createdPlaylist);
    }

    /// <summary>
    /// Update playlist
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] Playlist playlist)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var updatedPlaylist = await _playlistService.UpdatePlaylistAsync(id, playlist, userId);
        if (updatedPlaylist == null)
        {
            return NotFound();
        }
        return Ok(updatedPlaylist);
    }

    /// <summary>
    /// Delete playlist
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var result = await _playlistService.DeletePlaylistAsync(id, userId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    /// <summary>
    /// Add track to playlist
    /// </summary>
    [HttpPost("{id}/tracks/{trackId}")]
    public async Task<IActionResult> AddTrackToPlaylist(Guid id, Guid trackId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var result = await _playlistService.AddTrackToPlaylistAsync(id, trackId, userId);
        if (!result)
        {
            return NotFound(new { message = "Playlist not found or track already in playlist" });
        }
        return Ok(new { message = "Track added to playlist" });
    }

    /// <summary>
    /// Remove track from playlist
    /// </summary>
    [HttpDelete("{id}/tracks/{trackId}")]
    public async Task<IActionResult> RemoveTrackFromPlaylist(Guid id, Guid trackId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        var result = await _playlistService.RemoveTrackFromPlaylistAsync(id, trackId, userId);
        if (!result)
        {
            return NotFound();
        }
        return Ok(new { message = "Track removed from playlist" });
    }
}
